import { render, screen } from '@testing-library/react';
import CartPage from '../../src/app/cart/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('CartPage', () => {
  it('affiche "Panier"', () => {
    render(<CartPage />);
    expect(screen.getByText('Panier')).toBeInTheDocument();
  });
});
