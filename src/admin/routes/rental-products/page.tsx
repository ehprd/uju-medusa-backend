import {RouteConfig} from "@medusajs/admin"
import {useAdminProducts, useAdminCustomQuery, useAdminCustomPost, useAdminCustomDelete} from "medusa-react"
import {useState} from "react"
import {Product} from "@medusajs/medusa"
import {Table, Button} from "@medusajs/ui"

// RentalProduct 타입 정의 추가
type RentalProduct = {
    id: string;
    product_id: string;
    short_term_rate: number;
    medium_term_rate: number;
    long_term_rate: number;
    rental_periods: {
        short_term: { min: number; max: number };
        medium_term: { min: number; max: number };
        long_term: { min: number };
    };
}

const RentalProductsPage = () => {
    const [selectedProduct, setSelectedProduct] = useState<string>("")
    const [rentalProductData, setRentalProductData] = useState({
        short_term_rate: 0,
        medium_term_rate: 0,
        long_term_rate: 0,
        rental_periods: {
            short_term: {min: 1, max: 7},
            medium_term: {min: 8, max: 30},
            long_term: {min: 31},
        },
    })

    const {products} = useAdminProducts()
    const {data, isLoading, refetch} = useAdminCustomQuery<{ rental_products: RentalProduct[] }>(
        `/admin/rental-products`,
        ["admin_rental_products"]
    )

    const {mutate: createRentalProduct, isLoading: isCreating} = useAdminCustomPost(
        `/admin/rental-products`,
        ["admin_rental_products"]
    )

    const {mutate: deleteRentalProduct} = useAdminCustomDelete(
        `/admin/rental-products/:id`,
        ["admin_rental_products"]
    )

    const handleCreateRentalProduct = () => {
        createRentalProduct({
            product_id: selectedProduct,
            ...rentalProductData,
        }, {
            onSuccess: () => {
                refetch()
                setSelectedProduct("")
                setRentalProductData({
                    short_term_rate: 0,
                    medium_term_rate: 0,
                    long_term_rate: 0,
                    rental_periods: {
                        short_term: {min: 1, max: 7},
                        medium_term: {min: 8, max: 30},
                        long_term: {min: 31},
                    },
                })
            }
        })
    }

    const handleDeleteRentalProduct = (id: string) => {
        // @ts-ignore
        deleteRentalProduct(id, {
            onSuccess: () => {
                refetch()
            }
        })
    }

    if (isLoading) return <div>Loading...</div>

    const rentalProducts = data?.rental_products || []

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Rental Products</h1>

            <div className="mb-4">
                <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="mr-2 p-2 border rounded"
                >
                    <option value="">Select a product</option>
                    {products?.map((product: Product) => (
                        <option key={product.id} value={product.id}>{product.title}</option>
                    ))}
                </select>
                <input
                    type="number"
                    value={rentalProductData.short_term_rate}
                    onChange={(e) => setRentalProductData({
                        ...rentalProductData,
                        short_term_rate: parseInt(e.target.value)
                    })}
                    className="mr-2 p-2 border rounded"
                    placeholder="Short Term Rate"
                />
                <input
                    type="number"
                    value={rentalProductData.medium_term_rate}
                    onChange={(e) => setRentalProductData({
                        ...rentalProductData,
                        medium_term_rate: parseInt(e.target.value)
                    })}
                    className="mr-2 p-2 border rounded"
                    placeholder="Medium Term Rate"
                />
                <input
                    type="number"
                    value={rentalProductData.long_term_rate}
                    onChange={(e) => setRentalProductData({
                        ...rentalProductData,
                        long_term_rate: parseInt(e.target.value)
                    })}
                    className="mr-2 p-2 border rounded"
                    placeholder="Long Term Rate"
                />
                <button
                    onClick={handleCreateRentalProduct}
                    disabled={isCreating || !selectedProduct}
                    className="bg-blue-500 text-white p-2 rounded"
                >
                    Create Rental Product
                </button>
            </div>

            {rentalProducts.length > 0 ? (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Product ID</Table.HeaderCell>
                            <Table.HeaderCell>Short Term Rate</Table.HeaderCell>
                            <Table.HeaderCell>Medium Term Rate</Table.HeaderCell>
                            <Table.HeaderCell>Long Term Rate</Table.HeaderCell>
                            <Table.HeaderCell>Actions</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {rentalProducts.map((rentalProduct) => (
                            <Table.Row key={rentalProduct.id}>
                                <Table.Cell>{rentalProduct.product_id}</Table.Cell>
                                <Table.Cell>{rentalProduct.short_term_rate}</Table.Cell>
                                <Table.Cell>{rentalProduct.medium_term_rate}</Table.Cell>
                                <Table.Cell>{rentalProduct.long_term_rate}</Table.Cell>
                                <Table.Cell>
                                    <Button
                                        variant="danger"
                                        size="small"
                                        onClick={() => handleDeleteRentalProduct(rentalProduct.id)}
                                    >
                                        Delete
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            ) : (
                <p className="text-ui-fg-subtle">No rental products found.</p>
            )}
        </div>
    )
}

export const config: RouteConfig = {
    link: {
        label: "Rental Products",
    },
}

export default RentalProductsPage
