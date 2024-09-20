import { render, screen, fireEvent } from '@testing-library/react';
import MainPage from '../MainPage';

describe('MainPage', () => {
  it('should call handleEditFile when the Edit button is clicked', () => {
    // Mock the handleEditFile function
    const handleEditFile = jest.fn();

    // Render the MainPage component with the mocked handleEditFile function
    render(<MainPage handleEditFile={handleEditFile} />);

    // Find the Edit button by its alt text
    const editButton = screen.getByAltText('Edit');

    // Simulate a click event on the Edit button
    fireEvent.click(editButton);

    // Assert that the handleEditFile function is called
    expect(handleEditFile).toHaveBeenCalledTimes(1);
  });
});