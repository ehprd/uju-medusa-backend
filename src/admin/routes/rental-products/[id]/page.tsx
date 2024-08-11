import {Link, useParams} from "react-router-dom"
import {useAdminCustomQuery} from "medusa-react"
import {
    Container,
    Heading,
    Text,
    Button,
    Table
} from "@medusajs/ui"
import {RouteConfig} from "@medusajs/admin"
import {Product} from "@medusajs/medusa";

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


const RentalProductDetailPage = () => {
    const {id} = useParams()
    const {data: rentalProductData, isLoading} = useAdminCustomQuery<{ rental_product: RentalProduct }>(
        `/admin/rental-products/${id}`,
        ["admin_rental_product", id]
    )

    const rentalProduct = rentalProductData?.rental_product

    if (isLoading) return <Text>Loading...</Text>
    if (!rentalProduct) return <Text>Rental product not found</Text>

    return (
        <Container>
            <Heading level="h1" className="mb-4">Rental Product Details</Heading>
            <div className="space-y-6">
                <div>
                    <Heading level="h2" className="mb-2">Basic Information</Heading>
                    <Table>
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell>Rental Product ID</Table.Cell>
                                <Table.Cell>{rentalProduct.id}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>Product ID</Table.Cell>
                                <Table.Cell>{rentalProduct.product_id}</Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                </div>

                <div>
                    <Heading level="h2" className="mb-2">Rental Rates</Heading>
                    <Table>
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell>Short Term Rate</Table.Cell>
                                <Table.Cell>{rentalProduct.short_term_rate}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>Medium Term Rate</Table.Cell>
                                <Table.Cell>{rentalProduct.medium_term_rate}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>Long Term Rate</Table.Cell>
                                <Table.Cell>{rentalProduct.long_term_rate}</Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                </div>

                <div>
                    <Heading level="h2" className="mb-2">Rental Periods</Heading>
                    <Table>
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell>Short Term</Table.Cell>
                                <Table.Cell>{rentalProduct.rental_periods.short_term.min} - {rentalProduct.rental_periods.short_term.max} days</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>Medium Term</Table.Cell>
                                <Table.Cell>{rentalProduct.rental_periods.medium_term.min} - {rentalProduct.rental_periods.medium_term.max} days</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>Long Term</Table.Cell>
                                <Table.Cell>{rentalProduct.rental_periods.long_term.min}+ days</Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                </div>

                <div className="flex space-x-4">

                    <Link to={`/a/rental-products/${rentalProduct.id}`}
                          className="text-blue-500 hover:underline">
                        <Button variant="secondary">View Full Product Details</Button>
                    </Link>
                    <Link to={`/a/rental-products/${rentalProduct.id}`}
                          className="text-blue-500 hover:underline">
                        <Button variant="secondary">Back to Rental Products</Button>
                    </Link>
                </div>
            </div>
        </Container>
    )
}

export default RentalProductDetailPage
