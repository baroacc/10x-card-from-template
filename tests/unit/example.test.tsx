import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Example component test
describe('Example test suite', () => {
  it('should demonstrate a basic test', () => {
    expect(true).toBe(true);
  });

  it('should demonstrate async testing', async () => {
    const user = userEvent.setup();
    
    render(
      <button onClick={() => console.log('clicked')}>
        Click me
      </button>
    );

    const button = screen.getByText('Click me');
    expect(button).toBeInTheDocument();

    await user.click(button);
  });
}); 