const FormField = ({
  label,
  name,
  type = 'input',
  register,
  error,
  placeholder,
  helpText,
  options = [],
  className = '',
  disabled = false,
  ...props
}) => {
  const baseInputStyles = `block w-full px-3 py-2.5 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm transition-all ${
    error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
  } ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'}`;

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...register?.(name)}
            placeholder={placeholder}
            disabled={disabled}
            className={`${baseInputStyles} min-h-[80px] resize-y`}
            {...props}
          />
        );

      case 'select':
        return (
          <select
            {...register?.(name)}
            disabled={disabled}
            className={baseInputStyles}
            {...props}
          >
            <option value="">{placeholder || 'Seleccionar...'}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            {...register?.(name)}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={baseInputStyles}
            {...props}
          />
        );
    }
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      {renderInput()}
      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-400">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};

export default FormField;
