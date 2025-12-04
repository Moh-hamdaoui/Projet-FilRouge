// tests/integration/cart.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import CartPage from '../../src/app/cart/page';

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock du module cart pour éviter d'utiliser le localStorage réel
jest.mock('@/lib/cart', () => ({
  getCart: () => ({ '68be11ae6214396c6f67e9fe': 1 }),
  remove: jest.fn(),
  clear: jest.fn(),
  asIdList: () => ['68be11ae6214396c6f67e9fe'],
}));

describe('CartPage intégration API', () => {
  beforeEach(() => {
    // Mock global fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            items: [
              {
                id: '68be11ae6214396c6f67e9fe',
                name: 'Truffle Brie',
                price: 12.9,
                imageUrl: 'https://svfxlxuiyjd7rt5z.public.blob.vercel-storage.com/burger8.jpg',
                isAvailable: false,
              },
            ],
          }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('affiche le produit récupéré depuis l’API', async () => {
    render(<CartPage />);

    // Vérifie que le titre Panier est présent
    expect(screen.getByText('Panier')).toBeInTheDocument();

    // Attend que le produit soit affiché
    await waitFor(() => {
      expect(screen.getByText('Truffle Brie')).toBeInTheDocument();
    
      const prices = screen.getAllByText(/12,90/);
      expect(prices[0]).toBeInTheDocument();
    });
  });
});
