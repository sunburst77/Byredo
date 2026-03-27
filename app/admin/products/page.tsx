import { createCategoryAction, createProductAction, deleteProductAction, updateProductAction } from '@/app/admin/actions'
import { ProductsManagement } from '@/components/admin/ProductsManagement'
import { getAdminCategories, getAdminProducts } from '@/lib/admin/data'

type ProductsPageProps = {
  searchParams?: {
    q?: string
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()])

  return (
    <ProductsManagement
      initialProducts={products}
      initialQuery={searchParams?.q ?? ''}
      categories={categories}
      onCreateCategoryAction={createCategoryAction}
      onCreateProductAction={createProductAction}
      onUpdateProductAction={updateProductAction}
      onDeleteProductAction={deleteProductAction}
    />
  )
}
