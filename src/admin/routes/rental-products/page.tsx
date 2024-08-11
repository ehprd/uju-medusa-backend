import {
    useAdminProducts,
    useAdminCustomPost,
    useAdminCustomQuery,
    useAdminCustomDelete,
    useAdminCreateProduct
} from "medusa-react"
import React, {useState} from "react"
import {Table, Button, Container, Heading} from "@medusajs/ui"
import {RouteConfig} from "@medusajs/admin";
import {Product} from "@medusajs/medusa";
import {Link, useNavigate} from "react-router-dom";

type CreateProductData = {
    title: string
    is_giftcard: boolean
    discountable: boolean
    options: { title: string }[]
    variants: {
        title: string
        prices: {
            amount: number,
            currency_code: string
        }[]
        options: { value: string }[]
    }[],
    collection_id: string
    categories: { id: string }[]
    type: { value: string }
    tags: { value: string }[]
}
// RentalProduct 타입 정의 추가
type RentalProduct = {
    id: string;
    product_id: string;
    product: Product;
    short_term_rate: number;
    medium_term_rate: number;
    long_term_rate: number;
    rental_periods: {
        short_term: { min: number; max: number };
        medium_term: { min: number; max: number };
        long_term: { min: number };
    };
}

type RentalProductItemProps = {
    rentalProduct: RentalProduct;
};

const RentalProductsPage = () => {
    const navigate = useNavigate()
    const { data, isLoading } = useAdminCustomQuery<{ rental_products: RentalProduct[] }>(
        `/admin/rental-products`,
        ["admin_rental_products"]
    )

    if (isLoading) return <div>Loading...</div>

    const rentalProducts = data?.rental_products || []

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Rental Products</h1>
                <Button
                    variant="primary"
                    size="small"
                    onClick={() => navigate("/a/products/new")}
                >
                    Create Rental Product
                </Button>
            </div>

            {rentalProducts.length > 0 ? (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Title</Table.HeaderCell>
                            <Table.HeaderCell>Product ID</Table.HeaderCell>
                            <Table.HeaderCell>Short Term Rate</Table.HeaderCell>
                            <Table.HeaderCell>Medium Term Rate</Table.HeaderCell>
                            <Table.HeaderCell>Long Term Rate</Table.HeaderCell>
                            <Table.HeaderCell>Actions</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {rentalProducts.map((rentalProduct) => (
                            <RentalProductItem
                                key={rentalProduct.id}
                                rentalProduct={rentalProduct}
                            />
                        ))}
                    </Table.Body>
                </Table>
            ) : (
                <p className="text-ui-fg-subtle">No rental products found.</p>
            )}
        </div>
    )
}


const RentalProductItem: React.FC<RentalProductItemProps> = ({ rentalProduct }) => {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const { mutate: deleteRentalProduct } = useAdminCustomDelete(
        `/admin/rental-products/${rentalProduct.id}`,
        ["admin_rental_products"]
    )

    const handleDeleteRentalProduct = () => {
        deleteRentalProduct(void 0, {
            onSuccess: () => {
                setShowDeleteConfirmation(false)
                // 여기서 목록을 새로고침하는 함수를 호출할 수 있습니다.
                // 예: refetchRentalProducts()
            },
        });
    };

    return (
        <>
            <Table.Row key={rentalProduct.id}>
                <Table.Cell>
                    <Link
                        to={`/a/rental-products/${rentalProduct.id}`}
                        className="text-blue-500 hover:underline"
                    >
                        {rentalProduct.product.title}
                    </Link>
                </Table.Cell>
                <Table.Cell>
                    <Link
                        to={`/a/products/${rentalProduct.product_id}`}
                        className="text-blue-500 hover:underline"
                    >
                        {rentalProduct.product_id}
                    </Link>
                </Table.Cell>
                <Table.Cell>{rentalProduct.short_term_rate}</Table.Cell>
                <Table.Cell>{rentalProduct.medium_term_rate}</Table.Cell>
                <Table.Cell>{rentalProduct.long_term_rate}</Table.Cell>
                <Table.Cell>
                    <Button
                        variant="danger"
                        size="small"
                        onClick={() => setShowDeleteConfirmation(true)}
                    >
                        Delete
                    </Button>
                </Table.Cell>
            </Table.Row>

            {showDeleteConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Container className="bg-white p-6 rounded-lg max-w-sm w-full">
                        <Heading level="h2" className="mb-4">Confirm Deletion</Heading>
                        <p className="mb-4 text-gray-700">Are you sure you want to delete this rental product? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-2">
                            <Button variant="secondary" size="small" onClick={() => setShowDeleteConfirmation(false)}>
                                Cancel
                            </Button>
                            <Button variant="danger" size="small" onClick={handleDeleteRentalProduct}>
                                Delete
                            </Button>
                        </div>
                    </Container>
                </div>
            )}
        </>
    );
};

export const config: RouteConfig = {
    link: {
        label: "Rental Products",
    },
}

export default RentalProductsPage
