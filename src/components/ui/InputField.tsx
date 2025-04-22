interface InputFieldProps {
  label?: string;
  type: string;
  className?: string;
}

export default function InputField({
  type = 'text',
  label,
  className,
  ...props
}: InputFieldProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col">
      <input
        id={label}
        type={type}
        className={`border border-border-gray placeholder:text-black-secondary-text  placeholder:font-medium placeholder:text-sm outline-none rounded-md p-2 ${className}`}
        {...props}
      />
    </div>
  );
}
