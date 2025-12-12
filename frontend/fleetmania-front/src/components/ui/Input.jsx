const Input = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-yellow-500 transition-colors"
      />
    </div>
  );
};

export default Input;
