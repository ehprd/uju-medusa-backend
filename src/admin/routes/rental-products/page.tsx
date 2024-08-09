import {
    useAdminProducts,
    useAdminCustomPost,
    useAdminCustomQuery,
    useAdminCustomDelete,
    useAdminCreateProduct
} from "medusa-react"
import {useState} from "react"
import {Table, Button} from "@medusajs/ui"
import {RouteConfig} from "@medusajs/admin";

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

    const [showCreateForm, setShowCreateForm] = useState(false)
    const [rentalProductData, setRentalProductData] = useState({
        title: "",
        short_term_rate: 0,
        medium_term_rate: 0,
        long_term_rate: 0,
        rental_periods: {
            short_term: {min: 1, max: 7},
            medium_term: {min: 8, max: 30},
            long_term: {min: 31},
        },
    })

    const {products, refetch: refetchProducts} = useAdminProducts()
    const {data, isLoading, refetch} = useAdminCustomQuery<{ rental_products: RentalProduct[] }>(
        `/admin/rental-products`,
        ["admin_rental_products"]
    )

    const {mutate: createProduct, isLoading: isCreatingProduct} = useAdminCreateProduct()

    const {mutate: createRentalProduct, isLoading: isCreatingRentalProduct} = useAdminCustomPost(
        `/admin/rental-products`,
        ["admin_rental_products"]
    )

    const handleCreateRentalProduct = () => {
        createProduct(
            {
                title: rentalProductData.title,
                handle: rentalProductData.title.toLowerCase().replace(/ /g, "-"),
                description: "Generated with Rental Product",
                type: {value: "rental"},
                variants: [],
                options: [],
                is_giftcard: false, discountable: false, collection_id: null, categories: [], tags: []
            },
            {
                onSuccess: (data) => {
                    createRentalProduct(
                        {
                            product_id: data.product.id,
                            ...rentalProductData,
                        },
                        {
                            onSuccess: () => {
                                refetch()
                                refetchProducts()
                                setShowCreateForm(false)
                                setRentalProductData({
                                    title: "",
                                    short_term_rate: 0,
                                    medium_term_rate: 0,
                                    long_term_rate: 0,
                                    rental_periods: {
                                        short_term: {min: 1, max: 7},
                                        medium_term: {min: 8, max: 30},
                                        long_term: {min: 31},
                                    },
                                })
                            },
                        }
                    )
                },
            }
        )
    }

    if (isLoading) return <div>Loading...</div>

    const rentalProducts = data?.rental_products || []

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Rental Products</h1>

            {!showCreateForm ? (
                <Button
                    variant="primary"
                    size="small"
                    onClick={() => setShowCreateForm(true)}
                    className="mb-4"
                >
                    Create Rental Product
                </Button>
            ) : (
                <div className="mb-4">
                    <input
                        type="text"
                        value={rentalProductData.title}
                        onChange={(e) => setRentalProductData({
                            ...rentalProductData,
                            title: e.target.value
                        })}
                        className="mr-2 p-2 border rounded"
                        placeholder="Product Title"
                    />
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
                    <Button
                        variant="primary"
                        size="small"
                        onClick={handleCreateRentalProduct}
                        disabled={isCreatingProduct || isCreatingRentalProduct || !rentalProductData.title}
                        className="mr-2"
                    >
                        Create
                    </Button>
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => setShowCreateForm(false)}
                    >
                        Cancel
                    </Button>
                </div>
            )}

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
    const {mutate: deleteRentalProduct} = useAdminCustomDelete(
        `/admin/rental-products/${rentalProduct.id}`,
        ["admin_rental_products"]
    )


    const handleDeleteRentalProduct = (id: string) => {
        deleteRentalProduct(void 0, {
            onSuccess: () => {
                // refetch();
            },
        });
    };

    return (
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
    );
};


export const config: RouteConfig = {
    link: {
        label: "Rental Products",
    },
}

export default RentalProductsPage
