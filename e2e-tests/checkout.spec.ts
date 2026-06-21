import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('should successfully complete checkout', async ({ page }) => {
    // Navigate to product page
    await page.goto('/product/premium-dog-food');
    
    // Add to cart
    await page.locator('[data-testid="add-to-cart-btn"]').click();
    await expect(page.locator('.cart-count')).toHaveText('1');
    
    // Proceed to checkout
    await page.goto('/checkout');
    
    // Fill shipping info
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    await page.fill('[name="address"]', '123 QA Lane');
    await page.fill('[name="city"]', 'Techville');
    await page.fill('[name="zip"]', '12345');
    
    // Complete order
    await page.locator('[data-testid="place-order-btn"]').click();
    
    // Verify success
    await expect(page).toHaveURL(/\/order-confirmation/);
    await expect(page.locator('h1')).toContainText('Order Successful');
  });
});
