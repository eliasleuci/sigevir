import { useState, useCallback } from 'react';

const useFormState = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const onBlur = useCallback((name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const reset = useCallback((newValues) => {
    setValues(newValues || initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const setFormErrors = useCallback((errorMap) => {
    setErrors(errorMap);
  }, []);

  const handleSubmit = useCallback((onSubmit) => async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values]);

  const isFieldTouched = useCallback((name) => !!touched[name], [touched]);
  const getFieldError = useCallback((name) => (touched[name] ? errors[name] : undefined), [errors, touched]);
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    onChange,
    onBlur,
    reset,
    setFieldValue,
    setFieldError,
    setFormErrors,
    handleSubmit,
    isFieldTouched,
    getFieldError,
    setValues,
    setTouched,
  };
};

export default useFormState;
