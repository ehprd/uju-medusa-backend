// src/admin/widgets/rental-product-widget.tsx
import {WidgetConfig, ProductDetailsWidgetProps} from "@medusajs/admin"
import {useAdminCustomQuery, useAdminCustomPost} from "medusa-react"
import {useState} from "react"
import {
    Button,
    Container,
    Heading,
    Label,
    Input,
    Text
} from "@medusajs/ui"
import {useNavigate} from "react-router-dom"
import {RentalProduct} from "../../models/rental-product";

const RentalProductWidget = ({product}: ProductDetailsWidgetProps) => {
    const navigate = useNavigate()
    const [isEditing, setIsEditing] = useState(false)
    const [rentalData, setRentalData] = useState({
        short_term_rate: 0,
        medium_term_rate: 0,
        long_term_rate: 0,
    })

    const {data: rentalInfo, isLoading, refetch} = useAdminCustomQuery<{ rental_product: RentalProduct}>(
        `/admin/rental-products/product/${product.id}`,
        ["admin_rental_products", product.id]
    )


    const {mutate: updateRentalInfo, isLoading: isUpdating} = useAdminCustomPost(
        `/admin/rental-products/product/${product.id}`,
        ["rental_product", product.id]
    )

    const handleUpdate = () => {
        updateRentalInfo(rentalData, {
            onSuccess: () => {
                setIsEditing(false)
                refetch()
            }
        })
    }

    if (isLoading) return <Text>Loading...</Text>

    const rental_product = rentalInfo.rental_product


    if (rental_product === null) {
        return (
            <Container>
                <Heading level="h2">Rental Information</Heading>
                <Text>This product is not registered for rental.</Text>
                <Button
                    variant="primary"
                    size="small"
                    onClick={() => navigate(`/a/rental-products/register/${product.id}`)}
                >
                    Register as Rental Product
                </Button>
            </Container>
        )
    }

    if (isEditing) {
        return (
            <Container>
                <Heading level="h2">Edit Rental Information</Heading>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="short-term-rate">Short Term Rate</Label>
                        <Input
                            id="short-term-rate"
                            type="number"
                            value={rentalData.short_term_rate}
                            onChange={(e) => setRentalData({...rentalData, short_term_rate: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <Label htmlFor="medium-term-rate">Medium Term Rate</Label>
                        <Input
                            id="medium-term-rate"
                            type="number"
                            value={rentalData.medium_term_rate}
                            onChange={(e) => setRentalData({...rentalData, medium_term_rate: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <Label htmlFor="long-term-rate">Long Term Rate</Label>
                        <Input
                            id="long-term-rate"
                            type="number"
                            value={rentalData.long_term_rate}
                            onChange={(e) => setRentalData({...rentalData, long_term_rate: Number(e.target.value)})}
                        />
                    </div>
                    <Button
                        variant="primary"
                        size="small"
                        onClick={handleUpdate}
                        disabled={isUpdating}
                    >
                        Update Rental Information
                    </Button>
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => setIsEditing(false)}
                    >
                        Cancel
                    </Button>
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <Heading level="h2">Rental Information</Heading>
            <div className="space-y-2">
                <Text>Short Term Rate: {rental_product.short_term_rate}</Text>
                <Text>Medium Term Rate: {rental_product.medium_term_rate}</Text>
                <Text>Long Term Rate: {rental_product.long_term_rate}</Text>
            </div>
            <Button
                variant="secondary"
                size="small"
                onClick={() => setIsEditing(true)}
            >
                Edit Rental Information
            </Button>
        </Container>
    )
}

export const config: WidgetConfig = {
    zone: "product.details.after",
}

export default RentalProductWidget
