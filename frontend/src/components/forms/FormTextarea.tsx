import { Textarea } from "@/components/ui/textarea";

export function FormTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  const { label, id, ...rest } = props;
  const inputId = id ?? props.name ?? label;
  return (
    <label className="grid gap-2 text-sm font-medium" htmlFor={inputId}>
      {label}
      <Textarea id={inputId} {...rest} />
    </label>
  );
}
