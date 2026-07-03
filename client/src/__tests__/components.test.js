// src/__tests__/components.test.js
// React Testing Library tests for key UI components

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../utils/theme';

// Mock axios so tests don't hit the network
jest.mock('../api', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

import api from '../api';
import BadgeChip from '../components/common/BadgeChip';
import EmptyState from '../components/common/EmptyState';
import ImpactEstimator from '../components/impact/ImpactEstimator';
import ListingCard from '../components/listings/ListingCard';

// ── Test wrapper ───────────────────────────────────────────
const Wrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </BrowserRouter>
);

const render_ = (ui) => render(ui, { wrapper: Wrapper });

// ── BadgeChip ──────────────────────────────────────────────
describe('<BadgeChip />', () => {
  it('renders "Verified" badge', () => {
    render_(<BadgeChip badge="verified" />);
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('renders "Eco Champion" badge', () => {
    render_(<BadgeChip badge="eco_champion" />);
    expect(screen.getByText('Eco Champion')).toBeInTheDocument();
  });

  it('renders "Top Supplier" badge', () => {
    render_(<BadgeChip badge="top_supplier" />);
    expect(screen.getByText('Top Supplier')).toBeInTheDocument();
  });

  it('renders "Reliable" badge', () => {
    render_(<BadgeChip badge="reliable" />);
    expect(screen.getByText('Reliable')).toBeInTheDocument();
  });

  it('renders nothing for unknown badge', () => {
    const { container } = render_(<BadgeChip badge="unknown_badge" />);
    expect(container.firstChild).toBeNull();
  });
});

// ── EmptyState ─────────────────────────────────────────────
describe('<EmptyState />', () => {
  it('renders title and subtitle', () => {
    render_(<EmptyState title="Nothing here" subtitle="Try again later" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Try again later')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const onClick = jest.fn();
    render_(<EmptyState title="Empty" actionLabel="Add item" onAction={onClick} />);
    const btn = screen.getByText('Add item');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render button when actionLabel is absent', () => {
    render_(<EmptyState title="Empty" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

// ── ImpactEstimator ────────────────────────────────────────
describe('<ImpactEstimator />', () => {
  beforeEach(() => {
    api.post.mockResolvedValue({
      data: {
        data: {
          co2SavedKg: 55,
          byProductKg: 40,
          methaneAvoidedKg: 10,
        },
      },
    });
  });

  it('renders nothing when quantityKg is empty', () => {
    const { container } = render_(<ImpactEstimator quantityKg="" targetUse="compost" />);
    expect(container.firstChild).toBeNull();
  });

  it('shows impact estimate after debounce', async () => {
    jest.useFakeTimers();
    render_(<ImpactEstimator quantityKg="100" targetUse="compost" />);

    // Fast-forward debounce timer (600 ms)
    jest.advanceTimersByTime(700);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/impact/estimate', {
        quantityKg: 100,
        targetUse: 'compost',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('55 kg')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('displays the section header', () => {
    render_(<ImpactEstimator quantityKg="50" targetUse="both" />);
    expect(screen.getByText('Estimated impact of this listing')).toBeInTheDocument();
  });
});

// ── ListingCard ────────────────────────────────────────────
describe('<ListingCard />', () => {
  const listing = {
    _id: 'abc123',
    title: 'Fresh mango peels',
    description: 'Left over from juice production',
    category: 'fruit_waste',
    targetUse: 'animal_feed',
    quantityKg: 45,
    status: 'active',
    photos: [],
    location: { address: 'Mile 12 Market' },
    vendor: { _id: 'v1', name: 'Chidi Okafor', averageRating: 4.2, badges: [] },
  };

  it('renders listing title', () => {
    render_(<ListingCard listing={listing} />);
    expect(screen.getByText('Fresh mango peels')).toBeInTheDocument();
  });

  it('renders quantity', () => {
    render_(<ListingCard listing={listing} />);
    expect(screen.getByText('45 kg')).toBeInTheDocument();
  });

  it('renders vendor name', () => {
    render_(<ListingCard listing={listing} />);
    expect(screen.getByText('Chidi Okafor')).toBeInTheDocument();
  });

  it('renders category chip', () => {
    render_(<ListingCard listing={listing} />);
    expect(screen.getByText('🍅 Fruit')).toBeInTheDocument();
  });

  it('disables button for non-active listings', () => {
    render_(<ListingCard listing={{ ...listing, status: 'reserved' }} />);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('shows "View & request" for active listing', () => {
    render_(<ListingCard listing={listing} />);
    expect(screen.getByText('View & request')).toBeInTheDocument();
  });
});
