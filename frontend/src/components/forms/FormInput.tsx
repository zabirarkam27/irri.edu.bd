import { Input } from "@/components/ui/input";

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, id, ...rest } = props;
  const inputId = id ?? props.name ?? label;
  return (
    <label className="grid gap-2 text-sm font-medium" htmlFor={inputId}>
      {label}
      <Input id={inputId} {...rest} />
    </label>
  );
}
