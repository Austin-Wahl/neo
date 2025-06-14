import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { SubmitHandler, UseFormReturn } from "react-hook-form";
import { PuffLoader } from "react-spinners";

function MultipartForm<T extends Record<string, unknown>>({
  children,
  form,
  onSubmit,
  sections,
}: {
  children: ReactNode;
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  sections: Record<keyof T, number>;
}) {
  const [activeFormIndex, setActiveFormIndex] = useState(0);

  useEffect(() => {
    if (form.formState.isValid) return;

    const errors = form.formState.errors;
    const errorKeys = Object.keys(errors);
    const firstSectionWithError = sections[errorKeys[0]];
    setActiveFormIndex((prev) =>
      firstSectionWithError == undefined ? prev : firstSectionWithError
    );
  }, [form.formState.errors, form.formState.isValid, sections]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {React.Children.map(children, (formSection, index) => {
          console.log(activeFormIndex);
          return (
            <_FormSection
              index={index}
              total={React.Children.count(children)}
              setActiveFormIndex={setActiveFormIndex}
              isActive={activeFormIndex === index}
              form={form}
            >
              {React.Children.map(
                formSection,
                (formSectionChild) => formSectionChild
              )}
            </_FormSection>
          );
        })}
      </form>
    </Form>
  );
}

function _FormSection<T extends Record<string, unknown>>({
  children,
  index,
  total,
  setActiveFormIndex,
  isActive,
  form,
}: {
  children: ReactNode;
  total: number;
  index: number;
  setActiveFormIndex: Dispatch<SetStateAction<number>>;
  isActive: boolean;
  form: UseFormReturn<T>;
}) {
  function back() {
    if (index === 0) return;
    setActiveFormIndex((prev) => prev - 1);
  }

  function next() {
    if (index == total - 1) return;
    setActiveFormIndex((prev) => prev + 1);
  }

  return (
    <div className={`flex flex-col gap-4 ${isActive ? "block" : "hidden"}`}>
      <div>{children}</div>
      <div className="w-full flex flex-col gap-4 md:flex-row justify-between ">
        {index > 0 && (
          <Button
            onClick={back}
            type="button"
            disabled={form.formState.isSubmitting}
            variant="outline"
          >
            Back
          </Button>
        )}
        {index < total - 1 && (
          <Button
            onClick={next}
            type="button"
            disabled={form.formState.isSubmitting}
          >
            Next
          </Button>
        )}
        {index === total - 1 && (
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <PuffLoader size={16} />}Submit
          </Button>
        )}
      </div>
    </div>
  );
}

export const FormSection = ({ children }: { children?: ReactNode }) => {
  return <>{children}</>;
};

export default MultipartForm;
