"use client";

import { Field, SelectField, inputClass } from "./fields";
import { EXPERIENCE_OPTIONS, GOAL_OPTIONS } from "@/lib/accounts";

export type ProfileValues = { name: string; experience: string; goal: string; emailUpdates: boolean };

/** The profile fields on the account page (name and the two optional questions). Sign-up itself only asks for a name and an email. */
export default function ProfileFields({
  values, onChange, errors, disabled,
}: {
  values: ProfileValues;
  onChange: (patch: Partial<ProfileValues>) => void;
  errors: Partial<Record<keyof ProfileValues, string | null>>;
  disabled?: boolean;
}) {
  return (
    <>
      <Field id="name" label="Name" error={errors.name}>
        <input id="name" name="name" autoComplete="name" disabled={disabled} value={values.name} onChange={(e) => onChange({ name: e.target.value })} aria-invalid={Boolean(errors.name)} aria-describedby="name-msg" className={inputClass} />
      </Field>
      <SelectField id="experience" label="Your experience" optional disabled={disabled} value={values.experience} onChange={(v) => onChange({ experience: v })} options={EXPERIENCE_OPTIONS} placeholder="Prefer not to say" />
      <SelectField id="goal" label="What brings you here?" optional disabled={disabled} value={values.goal} onChange={(v) => onChange({ goal: v })} options={GOAL_OPTIONS} placeholder="Choose one" />
    </>
  );
}
