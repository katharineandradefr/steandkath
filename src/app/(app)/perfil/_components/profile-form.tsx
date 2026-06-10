"use client";

import { useEffect, useMemo, useState } from "react";

import { useActiveUser } from "~/app/_components/active-user-provider";
import { AvatarUpload } from "~/app/(app)/perfil/_components/avatar-upload";
import { Dropdown } from "~/app/(app)/perfil/_components/dropdown";
import { MultiDropdown } from "~/app/(app)/perfil/_components/multi-dropdown";
import {
  PENDENCY_AREA_BUTTON_SELECTED_STYLES,
  PENDENCY_AREA_BUTTON_STYLES,
  PENDENCY_AREA_KEYS,
  PENDENCY_AREA_LABELS,
  PENDENCY_PROJECT_KEYS,
  PENDENCY_PROJECT_LABELS,
  type PendencyAreaKey,
  type PendencyProjectKey,
} from "~/shared/pendency";
import {
  USER_ROLE_LABELS,
  USER_ROLES,
  showsProfileProjectsAndArea,
  type UserRole,
} from "~/shared/user";
import { api } from "~/trpc/react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ProfileFormState = {
  id: string | null;
  name: string;
  role: UserRole | null;
  email: string;
  phone: string;
  projects: PendencyProjectKey[];
  area: PendencyAreaKey | null;
  photoBase64: string | null;
};

const EMPTY_FORM: ProfileFormState = {
  id: null,
  name: "",
  role: null,
  email: "",
  phone: "",
  projects: [],
  area: null,
  photoBase64: null,
};

/**
 * Formulário de perfil do usuário com persistência via tRPC.
 */
export function ProfileForm() {
  const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const utils = api.useUtils();
  const { markProfileSetupComplete } = useActiveUser();
  const { data: existingUser, isLoading } = api.user.getFirst.useQuery();

  const upsertMutation = api.user.upsert.useMutation({
    onSuccess: async (savedUser) => {
      setForm({
        id: savedUser.id,
        name: savedUser.name,
        role: savedUser.role,
        email: savedUser.email,
        phone: savedUser.phone ?? "",
        projects: savedUser.projects,
        area: savedUser.area ?? null,
        photoBase64: savedUser.photoBase64 ?? null,
      });
      markProfileSetupComplete();
      setSaveMessage("Perfil salvo com sucesso.");
      setSaveError(null);
      await utils.user.invalidate();
    },
    onError: (error) => {
      setSaveError(
        error.message || "Não foi possível salvar o perfil. Tente novamente.",
      );
      setSaveMessage(null);
    },
  });

  useEffect(() => {
    if (!existingUser) return;
    setForm({
      id: existingUser.id,
      name: existingUser.name,
      role: existingUser.role,
      email: existingUser.email,
      phone: existingUser.phone ?? "",
      projects: existingUser.projects,
      area: existingUser.area ?? null,
      photoBase64: existingUser.photoBase64 ?? null,
    });
  }, [existingUser]);

  const roleOptions = useMemo(
    () =>
      USER_ROLES.map((role) => ({
        value: role,
        label: USER_ROLE_LABELS[role],
      })),
    [],
  );

  const projectOptions = useMemo(
    () =>
      PENDENCY_PROJECT_KEYS.map((key) => ({
        value: key,
        label: PENDENCY_PROJECT_LABELS[key],
      })),
    [],
  );

  const showProjectsAndArea =
    form.role !== null && showsProfileProjectsAndArea(form.role);

  const canSave =
    form.name.trim().length > 0 &&
    form.role !== null &&
    EMAIL_REGEX.test(form.email.trim()) &&
    (!showProjectsAndArea || form.projects.length > 0) &&
    !upsertMutation.isPending;

  const handleSave = () => {
    if (!canSave || !form.role) return;

    setSaveMessage(null);
    setSaveError(null);
    upsertMutation.mutate({
      id: form.id ?? undefined,
      name: form.name.trim(),
      role: form.role,
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      projects: showProjectsAndArea ? form.projects : [],
      area: showProjectsAndArea ? form.area : null,
      photoBase64: form.photoBase64,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[24rem] items-center justify-center rounded-3xl bg-gray-100 p-8">
        <p className="text-sm text-calendar-muted">Carregando perfil…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-3xl bg-calendar-bordeaux p-3 sm:p-4">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-gray-100 shadow-sm">
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mb-4 flex justify-center">
          <AvatarUpload
            value={form.photoBase64}
            onChange={(photoBase64) =>
              setForm((current) => ({ ...current, photoBase64 }))
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
          <div>
            <label
              htmlFor="profile-name"
              className="mb-1.5 block text-sm font-medium text-calendar-bordeaux"
            >
              Nome e Sobrenome:
            </label>
            <input
              id="profile-name"
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="w-full rounded-full bg-gray-200 px-4 py-2.5 text-sm text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
            />
          </div>

          <Dropdown
            label="Cargo"
            value={form.role}
            options={roleOptions}
            onChange={(role) =>
              setForm((current) => {
                const nextRole = role as UserRole;
                const showFields = showsProfileProjectsAndArea(nextRole);

                return {
                  ...current,
                  role: nextRole,
                  projects: showFields ? current.projects : [],
                  area: showFields ? current.area : null,
                };
              })
            }
            placeholder="Selecione o cargo"
          />

          <div
            className={`collapsible-section md:col-span-2 ${
              showProjectsAndArea
                ? "collapsible-section--expanded"
                : "collapsible-section--collapsed"
            }`}
          >
            <div className="collapsible-section-inner">
              <MultiDropdown
                label="Selecione de quais projetos participa:"
                values={form.projects}
                options={projectOptions}
                onChange={(projects) =>
                  setForm((current) => ({
                    ...current,
                    projects: projects as PendencyProjectKey[],
                  }))
                }
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="profile-email"
              className="mb-1.5 block text-sm font-medium text-calendar-bordeaux"
            >
              Email Corporativo:
            </label>
            <input
              id="profile-email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              className="w-full rounded-full bg-gray-200 px-4 py-2.5 text-sm text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
            />
          </div>

          <div>
            <label
              htmlFor="profile-phone"
              className="mb-1.5 block text-sm font-medium text-calendar-bordeaux"
            >
              Número para contato:
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({ ...current, phone: event.target.value }))
              }
              className="w-full rounded-full bg-gray-200 px-4 py-2.5 text-sm text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
            />
          </div>
        </div>

        <div
          className={`collapsible-section mt-6 ${
            showProjectsAndArea
              ? "collapsible-section--expanded"
              : "collapsible-section--collapsed"
          }`}
        >
          <div className="collapsible-section-inner">
            <p className="mb-2 text-sm font-medium text-calendar-bordeaux">
              Selecione a grande área:
            </p>
            <div className="flex flex-wrap gap-2">
              {PENDENCY_AREA_KEYS.map((areaKey) => {
                const selected = form.area === areaKey;
                return (
                  <button
                    key={areaKey}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        area: current.area === areaKey ? null : areaKey,
                      }))
                    }
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal ${
                      selected
                        ? PENDENCY_AREA_BUTTON_SELECTED_STYLES[areaKey]
                        : `${PENDENCY_AREA_BUTTON_STYLES[areaKey]} hover:brightness-95`
                    }`}
                  >
                    {PENDENCY_AREA_LABELS[areaKey]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-end gap-2">
          {saveMessage && (
            <p role="status" className="text-sm text-emerald-700">
              {saveMessage}
            </p>
          )}
          {saveError && (
            <p role="alert" className="text-sm text-red-600">
              {saveError}
            </p>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-2xl bg-gray-200 px-8 py-2.5 text-sm font-medium text-calendar-bordeaux transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calendar-cardinal"
          >
            {upsertMutation.isPending ? "Salvando…" : "Salvar"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
