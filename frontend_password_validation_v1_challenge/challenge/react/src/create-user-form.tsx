import {
  CSSProperties,
  Dispatch,
  SetStateAction,
  useState,
  FormEvent,
} from 'react';

interface CreateUserFormProps {
  setUserWasCreated: Dispatch<SetStateAction<boolean>>;
}

function CreateUserForm({ setUserWasCreated }: CreateUserFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validatePassword = (pwd: string) => {
    const out: string[] = [];

    if (pwd.length < 10)
      out.push('Password must be at least 10 characters long');
    if (pwd.length > 24)
      out.push('Password must be at most 24 characters long');
    if (/\s/.test(pwd)) out.push('Password cannot contain spaces');
    if (!/[0-9]/.test(pwd))
      out.push('Password must contain at least one number');
    if (!/[A-Z]/.test(pwd))
      out.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(pwd))
      out.push('Password must contain at least one lowercase letter');

    return out;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setApiError('');

    const pwdErrors = validatePassword(password);
    if (!username || pwdErrors.length) {
      setErrors(pwdErrors);
      return;
    }

    setSubmitting(true);

    try {
      const token = window.location.pathname.split('/').pop();
      const res = await fetch(
        `https://api.challenge.hennge.com/password-validation-challenge-api/001/challenge-signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setUserWasCreated(true);
        return;
      }

      if (res.status === 500) {
        setApiError('Something went wrong, please try again.');
      } else if (res.status === 401 || res.status === 403) {
        setApiError('Not authenticated to access this resource');
      } else if (data?.error === 'password_not_allowed') {
        setApiError(
          'Sorry, the entered password is not allowed, please try a different one.'
        );
      } else {
        setApiError('Something went wrong, please try again.');
      }
    } catch (err) {
      setApiError('Something went wrong, please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={formWrapper}>
      <form style={form} onSubmit={onSubmit} noValidate>
        {/* make sure the username and password are submitted */}
        {/* make sure the inputs have the accessible names of their labels */}

        <label style={formLabel} htmlFor="username">
          Username
        </label>
        <input
          style={formInput}
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label style={formLabel} htmlFor="password">
          Password
        </label>
        <input
          style={formInput}
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors(validatePassword(e.target.value));
            setApiError('');
          }}
          aria-invalid={errors.length > 0}
          required
        />

        {errors.length > 0 && (
          <ul style={{ paddingLeft: '18px', color: 'crimson', marginTop: 8 }}>
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        )}

        {apiError && (
          <div style={{ color: 'red', marginTop: 8 }}>{apiError}</div>
        )}

        <button style={formButton} disabled={submitting}>
          Create User
        </button>
      </form>
    </div>
  );
}

export { CreateUserForm };

const formWrapper: CSSProperties = {
  maxWidth: '500px',
  width: '80%',
  backgroundColor: '#efeef5',
  padding: '24px',
  borderRadius: '8px',
};

const form: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const formLabel: CSSProperties = {
  fontWeight: 700,
};

const formInput: CSSProperties = {
  outline: 'none',
  padding: '8px 16px',
  height: '40px',
  fontSize: '14px',
  backgroundColor: '#f8f7fa',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: '4px',
};

const formButton: CSSProperties = {
  outline: 'none',
  borderRadius: '4px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  backgroundColor: '#7135d2',
  color: 'white',
  fontSize: '16px',
  fontWeight: 500,
  height: '40px',
  padding: '0 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '8px',
  alignSelf: 'flex-end',
  cursor: 'pointer',
};