import { TransactionBaseService } from "@medusajs/medusa"
import { Product } from "@medusajs/medusa"

class RentalPricingService extends TransactionBaseService {
    calculatePrice(product: Product, startDate: Date, endDate: Date): number {
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
        const { dailyPrice, shortTermDailyPrice, longTermDailyPrice } = product.metadata

        let price = 0
        if (days <= 7) {
            price = parseFloat(String(shortTermDailyPrice || dailyPrice)) * days
        } else if (days <= 30) {
            price = parseFloat(String(dailyPrice)) * days
        } else {
            price = parseFloat(String(longTermDailyPrice || dailyPrice)) * days
        }

        return price
    }

    checkAvailability(product: Product, startDate: Date, endDate: Date): boolean {
        // 여기에 기간 중복 처리 로직을 구현합니다.
        // 예를 들어, 데이터베이스에서 해당 제품의 모든 예약을 조회하고
        // 새로운 예약 기간과 겹치는지 확인합니다.
        return true // 임시로 항상 사용 가능하다고 가정
    }
}

export default RentalPricingService
