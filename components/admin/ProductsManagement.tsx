'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/admin/StatusBadge'
import type { AdminCategoryOption, AdminProductRow } from '@/lib/admin/data'
import styles from './ProductsManagement.module.css'

type ProductsManagementProps = {
  initialProducts: AdminProductRow[]
  initialQuery?: string
  categories: AdminCategoryOption[]
  onCreateCategoryAction: (formData: FormData) => Promise<{ ok: boolean; message: string; category: AdminCategoryOption }>
  onCreateProductAction: (formData: FormData) => Promise<{ ok: boolean; message: string }>
  onUpdateProductAction: (formData: FormData) => Promise<{ ok: boolean; message: string }>
  onDeleteProductAction: (formData: FormData) => Promise<{ ok: boolean; message: string }>
}

type ProductFormState = {
  name: string
  price: string
  stock: string
  status: AdminProductRow['status']
  categoryId: string
  currentThumbnailUrl: string
}

const PRODUCT_STATUS_OPTIONS: AdminProductRow['status'][] = ['active', 'draft', 'inactive', 'sold_out']

const createInitialState = (categoryId: string): ProductFormState => ({
  name: '',
  price: '',
  stock: '0',
  status: 'draft',
  categoryId,
  currentThumbnailUrl: '',
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string | null) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

export function ProductsManagement({
  initialProducts,
  initialQuery = '',
  categories: initialCategories,
  onCreateCategoryAction,
  onCreateProductAction,
  onUpdateProductAction,
  onDeleteProductAction,
}: ProductsManagementProps) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const defaultCategoryId = categories[0]?.id ?? ''
  const [products, setProducts] = useState(initialProducts)
  const [query, setQuery] = useState(initialQuery)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [categoryMessage, setCategoryMessage] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const [createForm, setCreateForm] = useState<ProductFormState>(createInitialState(defaultCategoryId))
  const [createFile, setCreateFile] = useState<File | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<ProductFormState>(createInitialState(defaultCategoryId))
  const [editFile, setEditFile] = useState<File | null>(null)
  const [createMessage, setCreateMessage] = useState('')
  const [createError, setCreateError] = useState('')
  const [editMessage, setEditMessage] = useState('')
  const [editError, setEditError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [isCreatingCategory, startCategoryTransition] = useTransition()
  const [isCreating, startCreateTransition] = useTransition()
  const [isUpdating, startUpdateTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const normalizedQuery = query.trim().toLowerCase()
  const filteredProducts = useMemo(() => {
    if (!normalizedQuery) {
      return products
    }

    return products.filter((product) =>
      [product.name, product.sku, product.category, product.slug].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    )
  }, [normalizedQuery, products])

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId]
  )

  useEffect(() => {
    if (!selectedProduct) {
      return
    }

    setEditForm({
      name: selectedProduct.name,
      price: String(selectedProduct.price),
      stock: String(selectedProduct.stock),
      status: selectedProduct.status,
      categoryId: selectedProduct.categoryId,
      currentThumbnailUrl: selectedProduct.thumbnailUrl,
    })
    setEditFile(null)
    setEditError('')
    setEditMessage('')
  }, [selectedProduct])

  function getCategoryName(categoryId: string) {
    return categories.find((category) => category.id === categoryId)?.name ?? '-'
  }

  function updateCreateForm<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setCreateForm((current) => ({ ...current, [key]: value }))
  }

  function updateEditForm<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setEditForm((current) => ({ ...current, [key]: value }))
  }

  function buildProductFormData(form: ProductFormState, file: File | null) {
    const formData = new FormData()
    formData.set('name', form.name)
    formData.set('price', form.price)
    formData.set('stock', form.stock)
    formData.set('status', form.status)
    formData.set('categoryId', form.categoryId)
    formData.set('currentThumbnailUrl', form.currentThumbnailUrl)

    if (file) {
      formData.set('thumbnail', file)
    }

    return formData
  }

  function openCreateModal() {
    setCreateForm(createInitialState(defaultCategoryId))
    setCreateFile(null)
    setCreateError('')
    setCreateMessage('')
    setIsCreateModalOpen(true)
  }

  function handleCreateCategory() {
    const formData = new FormData()
    formData.set('name', categoryName)
    setCategoryError('')
    setCategoryMessage('')

    startCategoryTransition(async () => {
      try {
        const result = await onCreateCategoryAction(formData)
        setCategories((current) => [...current, result.category])
        setCreateForm((current) => ({ ...current, categoryId: result.category.id }))
        setCategoryName('')
        setCategoryMessage(result.message)
        setIsCategoryModalOpen(false)
        router.refresh()
      } catch (error) {
        setCategoryError(error instanceof Error ? error.message : '카테고리 생성 중 오류가 발생했습니다.')
      }
    })
  }

  function handleCreateProduct() {
    setCreateMessage('')
    setCreateError('')

    startCreateTransition(async () => {
      try {
        const result = await onCreateProductAction(buildProductFormData(createForm, createFile))
        const now = new Date().toISOString()
        const tempId = `temp-${Date.now()}`
        const thumbnailUrl = createFile ? URL.createObjectURL(createFile) : createForm.currentThumbnailUrl

        setProducts((current) => [
          {
            id: tempId,
            sku: `NEW-${Date.now().toString().slice(-6)}`,
            slug: `temp-${Date.now()}`,
            name: createForm.name,
            categoryId: createForm.categoryId,
            category: getCategoryName(createForm.categoryId),
            price: Number(createForm.price || 0),
            priceLabel: formatCurrency(Number(createForm.price || 0)),
            stock: Number(createForm.stock || 0),
            status: createForm.status,
            thumbnailUrl,
            createdAtRaw: now,
          },
          ...current,
        ])
        setCreateMessage(result.message)
        setCreateForm(createInitialState(categories[0]?.id ?? ''))
        setCreateFile(null)
        setIsCreateModalOpen(false)
        router.refresh()
      } catch (error) {
        setCreateError(error instanceof Error ? error.message : '상품 등록 중 오류가 발생했습니다.')
      }
    })
  }

  function handleUpdateProduct() {
    if (!selectedProduct) {
      return
    }

    const formData = buildProductFormData(editForm, editFile)
    formData.set('productId', selectedProduct.id)
    setEditMessage('')
    setEditError('')

    startUpdateTransition(async () => {
      try {
        const result = await onUpdateProductAction(formData)
        const thumbnailUrl = editFile ? URL.createObjectURL(editFile) : editForm.currentThumbnailUrl

        setProducts((current) =>
          current.map((product) =>
            product.id === selectedProduct.id
              ? {
                  ...product,
                  name: editForm.name,
                  categoryId: editForm.categoryId,
                  category: getCategoryName(editForm.categoryId),
                  price: Number(editForm.price || 0),
                  priceLabel: formatCurrency(Number(editForm.price || 0)),
                  stock: Number(editForm.stock || 0),
                  status: editForm.status,
                  thumbnailUrl,
                }
              : product
          )
        )
        setEditMessage(result.message)
        router.refresh()
      } catch (error) {
        setEditError(error instanceof Error ? error.message : '상품 수정 중 오류가 발생했습니다.')
      }
    })
  }

  function handleDeleteProduct(productId: string) {
    const formData = new FormData()
    formData.set('productId', productId)
    setDeleteError('')

    startDeleteTransition(async () => {
      try {
        await onDeleteProductAction(formData)
        setProducts((current) => current.filter((product) => product.id !== productId))
        if (selectedProductId === productId) {
          setSelectedProductId(null)
        }
        router.refresh()
      } catch (error) {
        setDeleteError(error instanceof Error ? error.message : '상품 삭제 중 오류가 발생했습니다.')
      }
    })
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Products</p>
          <h1 className={styles.title}>상품관리</h1>
          <p className={styles.description}>
            상품 목록, 가격, 재고, 노출 상태를 한 화면에서 관리하고 카테고리와 썸네일까지 포함해 새 상품을 등록하거나 기존 상품을 수정할 수 있습니다.
          </p>
        </div>
        <div className={styles.heroMeta}>
          <span className={styles.metaChip}>전체 {filteredProducts.length}개</span>
          <span className={styles.metaChip}>카테고리 {categories.length}개</span>
          <button type="button" className={styles.primaryButton} onClick={openCreateModal}>
            상품 등록
          </button>
        </div>
      </section>

      <section className={styles.metricGrid}>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Products</p>
          <p className={styles.metricValue}>{filteredProducts.length}</p>
          <p className={styles.metricMeta}>등록된 전체 상품</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Active</p>
          <p className={styles.metricValue}>{filteredProducts.filter((product) => product.status === 'active').length}</p>
          <p className={styles.metricMeta}>현재 노출 중</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Low Stock</p>
          <p className={styles.metricValue}>{filteredProducts.filter((product) => product.stock <= 10).length}</p>
          <p className={styles.metricMeta}>재고 10개 이하</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Sold Out</p>
          <p className={styles.metricValue}>{filteredProducts.filter((product) => product.status === 'sold_out').length}</p>
          <p className={styles.metricMeta}>품절 처리 상품</p>
        </article>
      </section>

      {createMessage ? <p className={styles.successText}>{createMessage}</p> : null}
      {categoryMessage ? <p className={styles.successText}>{categoryMessage}</p> : null}

      <section className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <div className={`${styles.tableRow} ${styles.tableHead}`}>
            <span>상품</span>
            <span>생성일</span>
            <span>가격</span>
            <span>재고</span>
            <span>카테고리</span>
            <span>노출상태</span>
            <span>관리</span>
          </div>
          {filteredProducts.length === 0 ? (
            <div className={styles.empty}>검색 결과가 없습니다.</div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className={styles.tableRow}>
                <div className={styles.productCell}>
                  {product.thumbnailUrl ? <img src={product.thumbnailUrl} alt={product.name} className={styles.tableThumb} /> : <div className={styles.tableThumbPlaceholder}>IMG</div>}
                  <div>
                    <p className={styles.primaryCell}>{product.name}</p>
                    <p className={styles.secondaryCell}>{product.sku}</p>
                  </div>
                </div>
                <span>{formatDate(product.createdAtRaw)}</span>
                <span>{product.priceLabel}</span>
                <span className={styles.primaryCell}>{product.stock}</span>
                <span>{product.category}</span>
                <span><StatusBadge status={product.status} /></span>
                <span className={styles.actionGroup}>
                  <button type="button" className={styles.secondaryButton} onClick={() => setSelectedProductId(product.id)}>수정</button>
                  <button type="button" className={styles.dangerButton} onClick={() => handleDeleteProduct(product.id)} disabled={isDeleting}>삭제</button>
                </span>
              </div>
            ))
          )}
        </div>
        {deleteError ? <p className={styles.errorText}>{deleteError}</p> : null}
      </section>

      {isCreateModalOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>Create Product</p>
                <h2 className={styles.sectionTitle}>상품 등록</h2>
              </div>
              <button type="button" className={styles.secondaryButton} onClick={() => setIsCreateModalOpen(false)}>닫기</button>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>상품명</span>
                <input className={styles.input} value={createForm.name} onChange={(event) => updateCreateForm('name', event.target.value)} placeholder="블랑쉬 50ml" />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>가격</span>
                <input className={styles.input} value={createForm.price} onChange={(event) => updateCreateForm('price', event.target.value)} placeholder="390000" />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>재고</span>
                <input className={styles.input} value={createForm.stock} onChange={(event) => updateCreateForm('stock', event.target.value)} placeholder="24" />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>노출 상태</span>
                <select className={styles.select} value={createForm.status} onChange={(event) => updateCreateForm('status', event.target.value as AdminProductRow['status'])}>
                  {PRODUCT_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>카테고리</span>
                <div className={styles.categorySelectWrap}>
                  <select className={styles.select} value={createForm.categoryId} onChange={(event) => updateCreateForm('categoryId', event.target.value)}>
                    {categories.length === 0 ? <option value="">카테고리 없음</option> : null}
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <button type="button" className={styles.secondaryButton} onClick={() => setIsCategoryModalOpen(true)}>
                    카테고리 추가
                  </button>
                </div>
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>썸네일</span>
                <input className={styles.fileInput} type="file" accept="image/*" onChange={(event) => setCreateFile(event.target.files?.[0] ?? null)} />
              </label>
            </div>

            <div className={styles.formFooter}>
              <div className={styles.thumbnailPreviewWrap}>
                {createFile ? <img src={URL.createObjectURL(createFile)} alt="새 썸네일 미리보기" className={styles.thumbnailPreview} /> : <div className={styles.thumbnailPlaceholder}>No Image</div>}
              </div>
              <button type="button" className={styles.primaryButton} onClick={handleCreateProduct} disabled={isCreating || categories.length === 0}>
                {isCreating ? '저장 중...' : '상품 등록'}
              </button>
            </div>

            {categories.length === 0 ? <p className={styles.errorText}>카테고리가 없으면 아래에서 먼저 추가해 주세요.</p> : null}
            {createError ? <p className={styles.errorText}>{createError}</p> : null}
          </div>
        </div>
      ) : null}

      {isCategoryModalOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.smallModalCard}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>Create Category</p>
                <h2 className={styles.sectionTitle}>카테고리 추가</h2>
              </div>
              <button type="button" className={styles.secondaryButton} onClick={() => setIsCategoryModalOpen(false)}>닫기</button>
            </div>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>카테고리명</span>
              <input className={styles.input} value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Perfume" />
            </label>
            <div className={styles.modalActions}>
              <button type="button" className={styles.primaryButton} onClick={handleCreateCategory} disabled={isCreatingCategory}>
                {isCreatingCategory ? '생성 중...' : '카테고리 저장'}
              </button>
            </div>
            {categoryError ? <p className={styles.errorText}>{categoryError}</p> : null}
          </div>
        </div>
      ) : null}

      {selectedProduct ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>Edit Product</p>
                <h2 className={styles.sectionTitle}>{selectedProduct.name}</h2>
              </div>
              <button type="button" className={styles.secondaryButton} onClick={() => setSelectedProductId(null)}>닫기</button>
            </div>

            <div className={styles.detailMeta}>
              <span>등록일 {formatDate(selectedProduct.createdAtRaw)}</span>
              <span>SKU {selectedProduct.sku}</span>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>상품명</span>
                <input className={styles.input} value={editForm.name} onChange={(event) => updateEditForm('name', event.target.value)} />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>가격</span>
                <input className={styles.input} value={editForm.price} onChange={(event) => updateEditForm('price', event.target.value)} />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>재고</span>
                <input className={styles.input} value={editForm.stock} onChange={(event) => updateEditForm('stock', event.target.value)} />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>노출 상태</span>
                <select className={styles.select} value={editForm.status} onChange={(event) => updateEditForm('status', event.target.value as AdminProductRow['status'])}>
                  {PRODUCT_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>카테고리</span>
                <select className={styles.select} value={editForm.categoryId} onChange={(event) => updateEditForm('categoryId', event.target.value)}>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>썸네일 교체</span>
                <input className={styles.fileInput} type="file" accept="image/*" onChange={(event) => setEditFile(event.target.files?.[0] ?? null)} />
              </label>
            </div>

            <div className={styles.formFooter}>
              <div className={styles.thumbnailPreviewWrap}>
                {editFile ? <img src={URL.createObjectURL(editFile)} alt="수정 썸네일 미리보기" className={styles.thumbnailPreview} /> : editForm.currentThumbnailUrl ? <img src={editForm.currentThumbnailUrl} alt={selectedProduct.name} className={styles.thumbnailPreview} /> : <div className={styles.thumbnailPlaceholder}>No Image</div>}
              </div>
              <button type="button" className={styles.primaryButton} onClick={handleUpdateProduct} disabled={isUpdating}>
                {isUpdating ? '저장 중...' : '수정 저장'}
              </button>
            </div>

            {editMessage ? <p className={styles.successText}>{editMessage}</p> : null}
            {editError ? <p className={styles.errorText}>{editError}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
