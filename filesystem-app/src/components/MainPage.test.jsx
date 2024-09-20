/** Importing necessary modules */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import MainPage from './MainPage';
import { BrowserRouter as Router } from 'react-router-dom';

/** Test suite for MainPage component */
describe('MainPage Component', () => {
  /** Test case to check rendering of main page */
  it('renders main page with buttons', () => {
    // Render the MainPage component within a Router context
    const { getByText, getByLabelText } = render(
      <Router>
        <MainPage />
      </Router>
    );

    /** Assertions for presence of main page elements */
    // Ensure that the necessary buttons and text elements are present on the main page
    expect(getByText('Welcome User!')).toBeInTheDocument();
    expect(getByText('Upload')).toBeInTheDocument();
    expect(getByText('Log out')).toBeInTheDocument();
  });

  /** Test case to check toggling upload section visibility */
  it('toggles upload section visibility on "Upload" button click', () => {
    // Render the MainPage component within a Router context
    const { getByText, queryByText } = render(
      <Router>
        <MainPage />
      </Router>
    );

    // Click the "Upload" button
    fireEvent.click(getByText('Upload'));
    // Check if the "Choose a file to Upload" text is visible
    expect(queryByText('Choose a file to Upload')).toBeInTheDocument(); // Upload section should be visible

    // Click the "Upload" button again
    fireEvent.click(getByText('Upload'));
    // Check if the "Choose a file to Upload" text is no longer visible
    expect(queryByText('Choose a file to Upload')).toBeNull(); // Upload section should be hidden
  });

  /** Test case to check file change and upload */
  it('handles file change and upload upon "Submit" button click', () => {
    // Render the MainPage component within a Router context
    const { getByText, getByLabelText } = render(
      <Router>
        <MainPage />
      </Router>
    );

    // Create a test file
    const file = new File(['file contents'], 'test.png', { type: 'image/png' });
    // Select the file input element
    const fileInput = getByLabelText('Choose a file to Upload');
    // Simulate file selection by changing the input value to the test file
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Click the "Submit" button
    fireEvent.click(getByText('Submit'));

    // Test fetch call or any other upload logic here
  });

  /** Test case to check navigation to home page upon logout */
  it('navigates to home page upon "Log out" button click', () => {
    // Mock the navigate function from react-router-dom
    const navigateMock = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => navigateMock
    }));

    // Render the MainPage component within a Router context
    const { getByText } = render(
      <Router>
        <MainPage />
      </Router>
    );

    // Click the "Log out" button
    fireEvent.click(getByText('Log out'));
    // Ensure that the navigate function is called with the home page URL '/'
    expect(navigateMock).toHaveBeenCalledWith('/');
  });

  /** Test case to check creating a new folder */
  it('creates a new folder upon "Create Folder" button click', () => {
    // Render the MainPage component within a Router context
    const { getByText, getByPlaceholderText } = render(
      <Router>
        <MainPage />
      </Router>
    );

    // Define the folder name
    const folderName = 'New Folder';
    // Select the input field for entering the folder name
    const folderInput = getByPlaceholderText('New Folder Name');
    // Simulate entering the folder name into the input field
    fireEvent.change(folderInput, { target: { value: folderName } });

    // Click the "Create Folder" button
    fireEvent.click(getByText('Create Folder'));

    // Ensure that the newly created folder with the specified name is rendered
    expect(getByText(folderName)).toBeInTheDocument();
  });

  /** Test case to check creating multiple folders */
  it('creates multiple folders in sequence', () => {
    // Render the MainPage component within a Router context
    const { getByText, getByPlaceholderText } = render(
      <Router>
        <MainPage />
      </Router>
    );

    // Define an array of folder names
    const folderNames = ['Folder 1', 'Folder 2', 'Folder 3'];
    // Iterate over the folder names array
    folderNames.forEach((folderName) => {
      // Select the input field for entering the folder name
      const folderInput = getByPlaceholderText('New Folder Name');
      // Simulate entering the folder name into the input field
      fireEvent.change(folderInput, { target: { value: folderName } });

      // Click the "Create Folder" button
      fireEvent.click(getByText('Create Folder'));

      // Ensure that the newly created folder with the specified name is rendered
      expect(getByText(folderName)).toBeInTheDocument();
    });
  });

  /** Test case to check toggling upload section visibility */
  it('toggles upload section visibility upon "Upload" button click', () => {
    // Render the MainPage component within a Router context
    const { getByText, queryByText } = render(
      <Router>
        <MainPage />
      </Router>
    );

    // Click the "Upload" button
    fireEvent.click(getByText('Upload'));
    // Check if the "Choose a file to Upload" text is visible
    expect(queryByText('Choose a file to Upload')).toBeInTheDocument(); // Upload section should be visible

    // Click the "Upload" button again
    fireEvent.click(getByText('Upload'));
    // Check if the "Choose a file to Upload" text is no longer visible
    expect(queryByText('Choose a file to Upload')).toBeNull(); // Upload section should be hidden
  });
});
