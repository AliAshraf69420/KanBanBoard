import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Card from '../../components/Card';
import { BoardProvider } from '../../context/boardProvider';
import { createCard } from '../../utils/models';

const wrapper = ({ children }) => <BoardProvider>{children}</BoardProvider>;

describe('Card', () => {
  const mockCard = createCard({
    listId: 'list-1',
    title: 'Test Card',
    description: 'Test description',
    tags: [],
  });

  it('should render card title', () => {
    render(<Card card={mockCard} />, { wrapper });
    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });

  it('should enter edit mode when title is clicked', async () => {
    const user = userEvent.setup();
    render(<Card card={mockCard} />, { wrapper });

    const titleElement = screen.getByText('Test Card');
    await user.click(titleElement);

    const input = screen.getByDisplayValue('Test Card');
    expect(input).toBeInTheDocument();
  });

  it('should enter edit mode when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<Card card={mockCard} />, { wrapper });

    const cardElement = screen.getByText('Test Card').closest('[tabindex="0"]');
    cardElement.focus();
    await user.keyboard('{Enter}');

    const input = screen.getByDisplayValue('Test Card');
    expect(input).toBeInTheDocument();
  });

  it('should save changes when input loses focus', async () => {
    const user = userEvent.setup();
    const { container } = render(<Card card={mockCard} />, { wrapper });

    const titleElement = screen.getByText('Test Card');
    await user.click(titleElement);

    const input = screen.getByDisplayValue('Test Card');
    await user.clear(input);
    await user.type(input, 'Updated Card');
    await user.tab(); // Blur the input

    await waitFor(() => {
      expect(screen.getByText('Updated Card')).toBeInTheDocument();
    });
  });

  it('should save changes when Enter is pressed in edit mode', async () => {
    const user = userEvent.setup();
    render(<Card card={mockCard} />, { wrapper });

    const titleElement = screen.getByText('Test Card');
    await user.click(titleElement);

    const input = screen.getByDisplayValue('Test Card');
    await user.clear(input);
    await user.type(input, 'Updated Card');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Updated Card')).toBeInTheDocument();
    });
  });

  it('should not be draggable when editing', async () => {
    const user = userEvent.setup();
    render(<Card card={mockCard} />, { wrapper });

    const titleElement = screen.getByText('Test Card');
    await user.click(titleElement);

    const cardElement = screen.getByDisplayValue('Test Card').closest('[draggable]');
    expect(cardElement).toHaveAttribute('draggable', 'false');
  });

  it('should handle drag start', () => {
    render(<Card card={mockCard} />, { wrapper });

    const cardElement = screen.getByText('Test Card').closest('[draggable]');
    const dragEvent = new Event('dragstart', { bubbles: true });
    dragEvent.dataTransfer = {
      setData: jest.fn(),
      effectAllowed: '',
    };

    fireEvent(cardElement, dragEvent);

    expect(dragEvent.dataTransfer.setData).toHaveBeenCalledWith(
      'text/plain',
      JSON.stringify({ cardId: mockCard.id, fromListId: mockCard.listId })
    );
  });

  it('should remove card when remove button is clicked', async () => {
    const user = userEvent.setup();
    render(<Card card={mockCard} />, { wrapper });

    const removeButton = screen.getByTitle('Remove Card');
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('Test Card')).not.toBeInTheDocument();
    });
  });

  it('should preserve title if input is empty on blur', async () => {
    const user = userEvent.setup();
    render(<Card card={mockCard} />, { wrapper });

    const titleElement = screen.getByText('Test Card');
    await user.click(titleElement);

    const input = screen.getByDisplayValue('Test Card');
    await user.clear(input);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Test Card')).toBeInTheDocument();
    });
  });
});

