"use client";

import { useState, type FormEvent } from "react";
import type { users } from "~/server/db/schema";

type User = typeof users.$inferSelect;

interface UsersClientProps {
  users: User[];
  createUserAction: (formData: FormData) => Promise<void>;
  deleteUserAction: (userId: number) => Promise<void>;
}

export function UsersClient({
  users,
  createUserAction,
  deleteUserAction,
}: UsersClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      setIsSaving(true);
      await createUserAction(formData);
      form.reset();
      setIsFormOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (userId: number) => {
    const confirmed = window.confirm("Delete this user?");
    if (!confirmed) return;

    try {
      setDeletingId(userId);
      await deleteUserAction(userId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pt-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold text-[#f0f6fc]">Users</h1>
          
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full max-w-[180px] rounded-lg bg-gradient-to-r from-[#58a6ff] to-[#bc8cff] px-4 py-2 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20"
        >
          Add User
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {users.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed border-[#30363d] p-8 text-center text-sm text-[#8b949e]">
            No users found. Add your first user using the button above.
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="card border border-[#30363d] p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-[#f0f6fc]">
                    {user.name}
                  </p>
                  <p className="text-sm text-[#8b949e]">{user.email}</p>
                  <p className="text-sm text-[#8b949e]">{user.phoneNumber}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(user.id)}
                  disabled={deletingId === user.id}
                  className="rounded-full border border-[#30363d] px-2 py-1 text-xs text-[#c9d1d9] transition-colors hover:bg-[#30363d] disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={`Delete ${user.name}`}
                >
                  {deletingId === user.id ? "…" : "✕"}
                </button>
              </div>
              <p className="mt-4 text-xs text-[#6e7681]">
                Joined{" "}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleString()
                  : "Unknown"}
              </p>
            </div>
          ))
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="card w-full max-w-md space-y-4 border border-[#30363d] p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#f0f6fc]">
                  Create User
                </h2>
                <p className="text-xs text-[#8b949e]">
                  Fill in the fields below to add a new user.
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-[#8b949e] transition-colors hover:text-[#f0f6fc]"
                aria-label="Close add user form"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[#c9d1d9]"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#f0f6fc] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] focus:outline-none"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#c9d1d9]"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#f0f6fc] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] focus:outline-none"
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-[#c9d1d9]"
                >
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  autoComplete="tel"
                  className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#f0f6fc] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] focus:outline-none"
                  placeholder="+1 555 123 4567"
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg border border-[#30363d] bg-[#21262d] px-4 py-2 text-sm font-medium text-[#c9d1d9] transition-colors hover:bg-[#30363d]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-[#58a6ff] to-[#bc8cff] px-4 py-2 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20"
                >
                  {isSaving ? "Saving..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

