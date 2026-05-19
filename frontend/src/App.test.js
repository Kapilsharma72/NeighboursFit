import { render, screen } from '@testing-library/react';
import App from './App';

// Mock axios to avoid ESM transform issues in Jest
jest.mock('axios');

test('renders the neighborhood matching form', () => {
  render(<App />);
  // The form renders a heading about neighborhood matching
  const heading = screen.getByText(/Find Your Perfect/i);
  expect(heading).toBeInTheDocument();
});
