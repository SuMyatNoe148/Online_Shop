import { Instagram } from "lucide-react";
import { ModelController } from "@/presentation/controllers/ModelController";

export const dynamic = "force-dynamic";

export const metadata = { title: "Models" };

export default async function ModelsPage() {
  const models = await ModelController.index();

  return (
    <section className="section">
      <div className="ab-container">
        <span className="ab-eyebrow">Faces of ABYSS</span>
        <h1
          style={{ fontSize: "clamp(2.4rem,6vw,4rem)", margin: "0.5rem 0 0.6rem" }}
        >
          The Models
        </h1>
        <p className="ab-muted mb-5" style={{ maxWidth: 560 }}>
          The faces that bring every ABYSS collection to life — from tailored
          shirts to heavyweight hoodies and sculpted tops.
        </p>

        <div className="row g-4">
          {models.map((m) => (
            <div className="col-md-6 col-lg-4" key={m.id}>
              <div className="ab-model">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.photo} alt={m.name} loading="lazy" />
                <div className="ab-model__info">
                  <span>{m.role}</span>
                  <div className="d-flex justify-content-between align-items-center">
                    <h4>{m.name}</h4>
                    {m.instagram && (
                      <span className="d-flex align-items-center gap-1 text-gold" style={{ fontSize: "0.78rem" }}>
                        <Instagram size={15} /> {m.instagram}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="ab-muted mt-3" style={{ fontSize: "0.9rem" }}>
                {m.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
