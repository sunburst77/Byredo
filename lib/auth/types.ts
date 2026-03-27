export type AuthMode = 'sign-in' | 'sign-up'

export type SignInInput = {
  email: string
  password: string
}

export type SignUpInput = {
  fullName: string
  email: string
  password: string
}

export type AuthResult = {
  ok: boolean
  message: string
}

export interface AuthService {
  signIn(input: SignInInput): Promise<AuthResult>
  signUp(input: SignUpInput): Promise<AuthResult>
}
