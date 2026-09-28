const relationshipBranches = [
  {
    person: "Ján Novák",
    role: "Konateľ",
    companies: ["Data Group s.r.o.", "ABC Holding a.s."],
  },
  {
    person: "Peter Horváth",
    role: "Spoločník",
    companies: ["Smart Invest s.r.o."],
  },
  {
    person: "Anna Nováková",
    role: "Prokurista",
    companies: [],
  },
];

export function RelationshipPreview() {
  return (
    <section className="relationship-preview-section" id="vztahy">
      <div className="section-heading">
        <span className="eyebrow">Grafické prepojenia</span>
        <h2>Ukážka vzťahov</h2>
        <p className="directory-intro">
          Ako fungujú prepojenia medzi firmami a osobami
        </p>
      </div>

      <div className="relationship-preview" aria-label="Ukážkový graf vzťahov medzi firmou a osobami">
        <div className="preview-company preview-root">
          <span className="preview-company-icon" aria-hidden="true">Q</span>
          <span>
            <strong>Q4 Solutions s.r.o.</strong>
            <small>Spoločnosť</small>
          </span>
          <span className="preview-node-state">Profil</span>
        </div>

        <div className="preview-branches">
          {relationshipBranches.map((branch, index) => (
            <article className={`preview-branch preview-branch-${index + 1}`} key={branch.person}>
              <div className="preview-person">
                <span className="preview-person-icon" aria-hidden="true">
                  {branch.person.split(" ").map((part) => part[0]).join("")}
                </span>
                <span>
                  <strong>{branch.person}</strong>
                  <small>{branch.role}</small>
                </span>
              </div>
              {branch.companies.length > 0 ? (
                <ul className="preview-linked-companies">
                  {branch.companies.map((company) => (
                    <li key={company}>
                      <span className="preview-company preview-related">
                        <span className="preview-related-icon" aria-hidden="true">▦</span>
                        <span>
                          <strong>{company}</strong>
                          <small>Prepojená spoločnosť</small>
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="preview-no-links">Zobraziť osobné prepojenia</p>
              )}
            </article>
          ))}
        </div>

        <p className="preview-disclaimer">
          Ukážkový graf na ilustráciu rozhrania. Skutočné väzby sa zobrazujú na profile
          subjektu podľa údajov dostupných v registri.
        </p>
      </div>
    </section>
  );
}
