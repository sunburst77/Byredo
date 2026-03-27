'use client'

import { useRef, useEffect, Suspense, MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

// ─── 카메라 키프레임 (6단계) ───────────────────────────────────────────────
interface CameraKeyframe {
  pos: [number, number, number]
  look: [number, number, number]
}

const CAMERA_STEPS: CameraKeyframe[] = [
  { pos: [0,    1.5, 4.5],  look: [0, 1,   0] }, // 0: 정면 전체샷
  { pos: [2,    2.5, 3],    look: [0, 1,   0] }, // 1: 사선 우상단 뷰
  { pos: [4.5,  0.8, 0],    look: [0, 1,   0] }, // 2: 측면샷
  { pos: [0.3,  5.5, 0.3],  look: [0, 1.2, 0] }, // 3: 탑뷰 (캡 열림)
  { pos: [0.5,  7,   1.5],  look: [0, 1,   0] }, // 4: 탑뷰 더 멀리 (캡 닫힘)
  { pos: [0,    1.5, 4.5],  look: [0, 1,   0] }, // 5: 정면 복귀
]

// 캡이 위로 올라가는 높이 (GLB 단위)
const CAP_LIFT = 1.8

// ─── 유틸리티 ─────────────────────────────────────────────────────────────

// 스크롤 진행률에서 캡 열림 정도(0~1) 계산
function computeCapOpen(progress: number): number {
  const S2_START = 2 / 6  // ≈0.333 step2 시작
  const S3_END   = 4 / 6  // ≈0.667 step3 끝
  const S4_END   = 5 / 6  // ≈0.833 step4 끝

  if (progress <= S2_START) return 0
  if (progress < 3 / 6)     return (progress - S2_START) / (1 / 6) // 0→1 (step2)
  if (progress <= S3_END)   return 1                                 // 완전 열림 (step3)
  if (progress < S4_END)    return 1 - (progress - S3_END) / (1 / 6) // 1→0 (step4)
  return 0
}

// 렌더 루프 재사용용 벡터 (GC 최소화)
const _posA   = new THREE.Vector3()
const _posB   = new THREE.Vector3()
const _lookA  = new THREE.Vector3()
const _lookB  = new THREE.Vector3()
const _camPos = new THREE.Vector3()
const _camLook = new THREE.Vector3()

// ─── 씬 내부 컴포넌트 ──────────────────────────────────────────────────────
interface SceneInnerProps {
  progressRef: MutableRefObject<number>
}

function SceneInner({ progressRef }: SceneInnerProps) {
  const { camera } = useThree()
  const { scene: gltfScene } = useGLTF('/assets/3D/byredo.glb')

  const capRef      = useRef<THREE.Object3D | null>(null)
  const capBaseYRef = useRef<number>(0)

  // 모델 로드 후 1회: 섀도우 활성화 + 캡 노드 탐색
  useEffect(() => {
    let capNode: THREE.Object3D | null = null

    gltfScene.traverse((child) => {
      // 섀도우 설정
      const mesh = child as THREE.Mesh
      if (mesh.isMesh) {
        mesh.castShadow    = true
        mesh.receiveShadow = true
      }

      // 캡 노드 탐색: 이름 기반 (우선)
      if (!capNode) {
        const n = child.name.toLowerCase()
        if (
          n.includes('cap')     ||
          n.includes('lid')     ||
          n.includes('top')     ||
          n.includes('cover')   ||
          n.includes('bouchon') ||
          n.includes('stopper')
        ) {
          capNode = child
        }
      }
    })

    // Fallback: 바운딩박스 Y 중심이 가장 높은 메시를 캡으로 간주
    if (!capNode) {
      let maxY = -Infinity
      const worldCenter = new THREE.Vector3()

      gltfScene.traverse((child) => {
        const mesh = child as THREE.Mesh
        if (!mesh.isMesh || !mesh.geometry) return

        mesh.geometry.computeBoundingBox()
        const box = mesh.geometry.boundingBox
        if (!box) return

        worldCenter.addVectors(box.min, box.max).multiplyScalar(0.5)
        const wp = worldCenter.clone()
        mesh.localToWorld(wp)

        if (wp.y > maxY) {
          maxY   = wp.y
          capNode = mesh
        }
      })
    }

    // TypeScript control-flow narrowing limitation workaround:
    // capNode is assigned inside traverse callbacks, so we cast explicitly.
    const resolvedCap = capNode as THREE.Object3D | null
    capRef.current      = resolvedCap
    capBaseYRef.current = resolvedCap !== null ? resolvedCap.position.y : 0
  }, [gltfScene])

  // 매 프레임: 카메라 보간 + 캡 애니메이션
  useFrame(() => {
    const p = progressRef.current

    // 진행률 → float index [0, 5]
    const fi = Math.min(4.9999, p * 5)
    const i0 = Math.floor(fi)
    const i1 = Math.min(5, i0 + 1)
    const t  = fi - i0

    const kf0 = CAMERA_STEPS[i0]
    const kf1 = CAMERA_STEPS[i1]

    _posA.set(...kf0.pos)
    _posB.set(...kf1.pos)
    _lookA.set(...kf0.look)
    _lookB.set(...kf1.look)

    _camPos.lerpVectors(_posA, _posB, t)
    _camLook.lerpVectors(_lookA, _lookB, t)

    // 부드러운 카메라 이동 (lerp factor: 0.05)
    camera.position.lerp(_camPos, 0.05)
    camera.lookAt(_camLook)

    // 캡 애니메이션
    if (capRef.current) {
      const openAmt = computeCapOpen(p)
      capRef.current.position.y = capBaseYRef.current + openAmt * CAP_LIFT
    }
  })

  return <primitive object={gltfScene} scale={1.9} />
}

// ─── 로딩 폴백 ─────────────────────────────────────────────────────────────
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 2, 0.5]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  )
}

// ─── 메인 내보내기 ──────────────────────────────────────────────────────────
interface PerfumeViewerProps {
  progressRef: MutableRefObject<number>
}

export default function PerfumeViewer({ progressRef }: PerfumeViewerProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.5, 4.5], fov: 45, near: 0.1, far: 100 }}
      gl={{
        antialias:           true,
        toneMapping:         THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* 씬 배경색 */}
      <color attach="background" args={['#f2f2f2']} />

      {/* 환경광 (최소) */}
      <ambientLight intensity={0.15} />

      {/* ① 메인 오버헤드 라이트 — 유리/액체 정반사 유도 */}
      <directionalLight
        position={[1, 9, 4]}
        intensity={3.5}
        castShadow
        shadow-mapSize={[2048, 2048] as [number, number]}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={8}
        shadow-camera-bottom={-2}
      />

      {/* ② 보조 라이트 — 측면 (쿨 보라빛) */}
      <pointLight
        position={[-5, 4, 2]}
        intensity={2.2}
        color="#dde8ff"
        distance={20}
      />

      {/* ③ 보조 라이트 — 후면 (웜 앰버) */}
      <pointLight
        position={[4, 2, -4]}
        intensity={1.8}
        color="#ffe4cc"
        distance={20}
      />

      {/* 스튜디오 환경맵 — 유리·금속 반사에 사용 */}
      <Environment preset="studio" />

      <Suspense fallback={<LoadingFallback />}>
        <SceneInner progressRef={progressRef} />

        {/* 바닥 소프트 그림자 */}
        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.4}
          scale={14}
          blur={2.8}
          far={7}
          color="#000000"
        />
      </Suspense>
    </Canvas>
  )
}

// 모델 사전 로딩
useGLTF.preload('/assets/3D/byredo.glb')
