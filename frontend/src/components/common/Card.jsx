const Card = ({ title, subtitle, children, footer, className = '', ...props }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-gray-50">
          {title && (
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}

      {children && (
        <div className="px-6 py-5">
          {children}
        </div>
      )}

      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
