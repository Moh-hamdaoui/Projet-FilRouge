import { test, expect } from '@playwright/test';

test.describe('CartPage E2E', () => {
  test('affiche le produit dans le panier', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cart', JSON.stringify({ '68be11ae6214396c6f67e9fe': 1 }));
    });

    await page.route('**/api/products', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: '68be11ae6214396c6f67e9fe',
              name: 'Truffle Brie',
              price: 12.9,
              imageUrl: 'https://svfxlxuiyjd7rt5z.public.blob.vercel-storage.com/burger8.jpg',
              isAvailable: true,
            },
          ],
        }),
      });
    });

    await page.goto('http://localhost:3000/cart');

    await expect(page.locator('h1', { hasText: 'Panier' })).toBeVisible();
    await expect(page.getByText('Truffle Brie')).toBeVisible();
    const productRow = page.getByText('Truffle Brie').locator('..');
    await expect(productRow.getByText('12,90 €')).toBeVisible();  
  });
});
