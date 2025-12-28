import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import List from '../../components/List';
import { BoardProvider } from '../../context/boardProvider';
import { createList, createCard } from '../../utils/models';

const wrapper = ({ children }) => <BoardProvider>{children}</BoardProvider>;

describe('List', () => {
  let mockList;

  beforeEach(() => {
    mockList = createList({ title: 'Test List' });
  });

  it('should render list title', () => {
    render(<List list={mockList} />, { wrapper });
    expect(screen.getByText('Test List')).toBeInTheDocument();
  });

  it('should render "No cards" when list is empty', () => {
    render(<List list={mockList} />, { wrapper });
    expect(screen.getByText('No cards')).toBeInTheDocument();
  });

  it('should add a card when "Add Card" button is clicked', async () => {
    const user = userEvent.setup();
    render(<List list={mockList} />, { wrapper });

    const addButton = screen.getByText('+ Add Card');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('New Card')).toBeInTheDocument();
    });
  });

  it('should enter edit mode when title is clicked', async () => {
    const user = userEvent.setup();
    render(<List list={mockList} />, { wrapper });

    const titleElement = screen.getByText('Test List');
    await user.click(titleElement);

    const input = screen.getByDisplayValue('Test List');
    expect(input).toBeInTheDocument();
  });

  it('should update list title when edited', async () => {
    const user = userEvent.setup();
    render(<List list={mockList} />, { wrapper });

    const titleElement = screen.getByText('Test List');
    await user.click(titleElement);

    const input = screen.getByDisplayValue('Test List');
    await user.clear(input);
    await user.type(input, 'Updated List');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Updated List')).toBeInTheDocument();
    });
  });

  it('should remove list when remove button is clicked', async () => {
    const user = userEvent.setup();
    render(<List list={mockList} />, { wrapper });

    const removeButton = screen.getByTitle('Remove List');
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('Test List')).not.toBeInTheDocument();
    });
  });

  it('should show add card button', () => {
    render(<List list={mockList} />, { wrapper });
    expect(screen.getByText('+ Add Card')).toBeInTheDocument();
  });

  it('should handle drag start for list header', () => {
    render(<List list={mockList} />, { wrapper });

    const header = screen.getByText('Test List').closest('[draggable]');
    const dragEvent = new Event('dragstart', { bubbles: true });
    dragEvent.dataTransfer = {
      setData: jest.fn(),
      effectAllowed: '',
    };

    fireEvent(header, dragEvent);

    expect(dragEvent.dataTransfer.setData).toHaveBeenCalled();
  });

  it('should not be draggable when editing title', async () => {
    const user = userEvent.setup();
    render(<List list={mockList} />, { wrapper });

    const titleElement = screen.getByText('Test List');
    await user.click(titleElement);

    const header = screen.getByDisplayValue('Test List').closest('[draggable]');
    expect(header).toHaveAttribute('draggable', 'false');
  });
});

