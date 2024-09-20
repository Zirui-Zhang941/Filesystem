/** Importing necessary modules */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from './RegisterPage';

/** Test suite for RegisterPage component */
describe('RegisterPage Component', () => {
  /** Test case to check rendering of registration form */
  it('renders the registration form', () => {
    const { getByText, getByPlaceholderText } = render(<RegisterPage />);

    /** Assertions for presence of registration form elements */
    expect(getByText('Sign up')).toBeInTheDocument();
    expect(getByPlaceholderText('Username')).toBeInTheDocument();
    expect(getByPlaceholderText('Password')).toBeInTheDocument();
    expect(getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    expect(getByText('Register')).toBeInTheDocument();
  });

  /** Test case to check validation of user inputs and prevention of registration if fields are empty */
  it('validates user inputs and prevents registration if fields are empty', async () => {
    const { getByText } = render(<RegisterPage />);
    const registerButton = getByText('Register');

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(getByText('You must provide both a username and password!')).toBeInTheDocument();
    });
  });

  /** Test case to check validation of user inputs and prevention of registration if passwords do not match */
  it('validates user inputs and prevents registration if passwords do not match', async () => {
    const { getByPlaceholderText, getByText } = render(<RegisterPage />);
    const usernameInput = getByPlaceholderText('Username');
    const passwordInput = getByPlaceholderText('Password');
    const repasswordInput = getByPlaceholderText('Confirm Password');
    const registerButton = getByText('Register');

    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(repasswordInput, { target: { value: 'differentPassword' } });

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(getByText('Your passwords do not match!')).toBeInTheDocument();
    });
  });

  /** Test case to check registration of user when inputs are valid */
  it('registers user when inputs are valid', async () => {
    const mockFetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ msg: 'Successful!' })
      })
    );
    global.fetch = mockFetch;

    const { getByPlaceholderText, getByText } = render(<RegisterPage />);
    const usernameInput = getByPlaceholderText('Username');
    const passwordInput = getByPlaceholderText('Password');
    const repasswordInput = getByPlaceholderText('Confirm Password');
    const registerButton = getByText('Register');

    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(repasswordInput, { target: { value: 'password123' } });

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('placeholder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'testUser',
          password: 'password123'
        })
      });
      expect(getByText('Successful!')).toBeInTheDocument();
    });
  });

  /** Test case to check handling of server response error during registration */
  it('handles server response error during registration', async () => {
    const mockFetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ msg: 'Registration failed!' })
      })
    );
    global.fetch = mockFetch;

    const { getByPlaceholderText, getByText } = render(<RegisterPage />);
    const usernameInput = getByPlaceholderText('Username');
    const passwordInput = getByPlaceholderText('Password');
    const repasswordInput = getByPlaceholderText('Confirm Password');
    const registerButton = getByText('Register');

    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(repasswordInput, { target: { value: 'password123' } });

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(getByText('Registration failed!')).toBeInTheDocument();
    });
  });
});
