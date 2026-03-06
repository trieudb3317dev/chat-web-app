"use client";

import React, { useEffect, useState } from "react";
import {
  me,
  updateProfile,
  uploadAvatar,
  resetPassword,
  changePassword,
} from "@/apis/client";

export default function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"profile" | "account">("profile");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStatus(null);
    setLoading(true);
    me()
      .then((d) => setProfile(d))
      .catch((e) => setStatus(String(e.message || e)))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const onSaveProfile = async () => {
    try {
      setLoading(true);
      setStatus(null);
      if (file) {
        await uploadAvatar(file);
      }
      const payload = {
        full_name: profile.full_name,
        email: profile.email,
        phone_number: profile.phone_number,
        address: profile.address,
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
      };
      await updateProfile(payload);
      setStatus("Profile updated");
    } catch (e: any) {
      setStatus(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  const onUploadChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0] ?? null;
    setFile(f);
  };

  const onResetPassword = async () => {
    try {
      setLoading(true);
      await resetPassword({ email: profile?.email });
      setStatus("Password reset requested (check email)");
    } catch (e: any) {
      setStatus(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async () => {
    // For brevity, prompt for current/new password. In production use a proper form.
    const current = prompt("Current password:") || "";
    const next = prompt("New password:") || "";
    if (!current || !next) return setStatus("Both passwords required");
    try {
      setLoading(true);
      await changePassword({ current_password: current, new_password: next });
      setStatus("Password changed");
    } catch (e: any) {
      setStatus(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-modal">
      <div className="settings-content">
        <div className="settings-tabs">
          <button
            onClick={() => setTab("profile")}
            style={{ fontWeight: tab === "profile" ? "700" : "400" }}
          >
            Profile
          </button>
          <button
            onClick={() => setTab("account")}
            style={{ fontWeight: tab === "account" ? "700" : "400" }}
          >
            Account
          </button>
          <div style={{ marginLeft: "auto" }}>
            <button onClick={onClose}>Close</button>
          </div>
        </div>

        {loading && <div>Loading...</div>}

        {tab === "profile" && (
          <div className="settings-profile-section">
            {profile ? (
              <div
                className="settings-profile-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 240px",
                  gap: 12,
                }}
              >
                <div className="settings-profile-form">
                  <div style={{ display: "grid", gap: 8 }} className="">
                    <label>Full name</label>
                    <input
                      value={profile.full_name ?? ""}
                      onChange={(e) =>
                        setProfile({ ...profile, full_name: e.target.value })
                      }
                    />
                    <label>Email</label>
                    <input
                      value={profile.email ?? ""}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                    />
                    <label>Phone</label>
                    <input
                      value={profile.phone_number ?? ""}
                      onChange={(e) =>
                        setProfile({ ...profile, phone_number: e.target.value })
                      }
                    />
                    <label>Address</label>
                    <input
                      value={profile.address ?? ""}
                      onChange={(e) =>
                        setProfile({ ...profile, address: e.target.value })
                      }
                    />
                    <label>Date of birth</label>
                    <input
                      type="date"
                      value={profile.date_of_birth ?? ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          date_of_birth: e.target.value,
                        })
                      }
                    />
                    <label>Gender</label>
                    <select
                      value={profile.gender ?? ""}
                      onChange={(e) =>
                        setProfile({ ...profile, gender: e.target.value })
                      }
                    >
                      <option value="">(unset)</option>
                      <option value="male">male</option>
                      <option value="female">female</option>
                    </select>
                  </div>
                </div>

                <div
                  className="settings-profile-avatar"
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <div className="settings-profile-avatar-label">Avatar</div>
                  <div
                    className="settings-profile-avatar-preview"
                    style={{
                      width: 160,
                      height: 160,
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "#f2f2f2",
                    }}
                  >
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div style={{ padding: 12 }}>No avatar</div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onUploadChange}
                  />
                  <div
                    style={{ display: "flex", gap: 8 }}
                    className="settings-profile-action"
                  >
                    <button onClick={onSaveProfile} disabled={loading}>
                      Save
                    </button>
                    <button onClick={onClose}>Cancel</button>
                  </div>
                </div>
              </div>
            ) : (
              <div>No profile</div>
            )}
          </div>
        )}

        {tab === "account" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <h4>Reset password</h4>
              <p>Request a password reset email.</p>
              <button onClick={onResetPassword} disabled={loading}>
                Send reset email
              </button>
            </div>

            <div>
              <h4>Change password</h4>
              <p>Change your current password.</p>
              <button onClick={onChangePassword} disabled={loading}>
                Change password
              </button>
            </div>
          </div>
        )}

        {status && <div style={{ marginTop: 12 }}>{status}</div>}
      </div>
    </div>
  );
}
