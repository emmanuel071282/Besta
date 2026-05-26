import { X, Ruler } from "lucide-react";

interface SizeGuideModalProps {
  category: string;
  subcategory?: string;
  onClose: () => void;
}

type Row = { size: string; [key: string]: string };
type TableSpec = { headers: string[]; rows: Row[] };

function getGuideSpec(category: string, subcategory: string): TableSpec | null {
  const isFootwearSize = ["Sneakers", "Formal Shoes", "Sandals", "Loafers", "Heels", "Boots", "School Shoes"].includes(subcategory);
  const isBra = subcategory === "Bras";
  const isKidsInfant = ["Rompers", "Onesies", "Sets", "Sleepsuits", "Booties"].includes(subcategory);

  if (category === "Footwear" || (["Mens", "Ladies", "Kids"].includes(category) && isFootwearSize)) {
    const isFeminine = category === "Ladies";
    return {
      headers: ["UK", "EU", "US", "CM"],
      rows: isFeminine
        ? [
            { size: "UK 3", EU: "36", US: "5", CM: "22.0" },
            { size: "UK 4", EU: "37", US: "6", CM: "23.0" },
            { size: "UK 5", EU: "38", US: "7", CM: "24.0" },
            { size: "UK 6", EU: "39", US: "8", CM: "25.0" },
            { size: "UK 7", EU: "40", US: "9", CM: "26.0" },
            { size: "UK 8", EU: "41", US: "10", CM: "27.0" },
          ]
        : [
            { size: "UK 6", EU: "39", US: "7", CM: "25.0" },
            { size: "UK 7", EU: "40", US: "8", CM: "26.0" },
            { size: "UK 8", EU: "41", US: "9", CM: "27.0" },
            { size: "UK 9", EU: "42", US: "10", CM: "28.0" },
            { size: "UK 10", EU: "43", US: "11", CM: "29.0" },
            { size: "UK 11", EU: "44", US: "12", CM: "30.0" },
          ],
    };
  }

  if (isBra) {
    return {
      headers: ["Size", "Band (cm)", "Cup"],
      rows: [
        { size: "30B", "Band (cm)": "65–70", Cup: "B" },
        { size: "32B", "Band (cm)": "70–75", Cup: "B" },
        { size: "32C", "Band (cm)": "70–75", Cup: "C" },
        { size: "34B", "Band (cm)": "75–80", Cup: "B" },
        { size: "34C", "Band (cm)": "75–80", Cup: "C" },
        { size: "36B", "Band (cm)": "80–85", Cup: "B" },
        { size: "36C", "Band (cm)": "80–85", Cup: "C" },
      ],
    };
  }

  if (category === "Kids" && isKidsInfant) {
    return {
      headers: ["Size", "Age", "Height (cm)", "Weight (kg)"],
      rows: [
        { size: "0-3M", Age: "0–3 months", "Height (cm)": "50–60", "Weight (kg)": "3–6" },
        { size: "3-6M", Age: "3–6 months", "Height (cm)": "60–67", "Weight (kg)": "6–8" },
        { size: "6-9M", Age: "6–9 months", "Height (cm)": "67–72", "Weight (kg)": "7–9" },
        { size: "9-12M", Age: "9–12 months", "Height (cm)": "72–78", "Weight (kg)": "8–10" },
        { size: "12-18M", Age: "12–18 months", "Height (cm)": "78–86", "Weight (kg)": "9–12" },
      ],
    };
  }

  if (category === "Kids") {
    return {
      headers: ["Size", "Age", "Height (cm)", "Chest (cm)", "Waist (cm)"],
      rows: [
        { size: "2-3Y", Age: "2–3 yrs", "Height (cm)": "92–98", "Chest (cm)": "52–54", "Waist (cm)": "51–52" },
        { size: "4-5Y", Age: "4–5 yrs", "Height (cm)": "104–110", "Chest (cm)": "56–58", "Waist (cm)": "53–54" },
        { size: "6-7Y", Age: "6–7 yrs", "Height (cm)": "116–122", "Chest (cm)": "60–62", "Waist (cm)": "55–57" },
        { size: "8-9Y", Age: "8–9 yrs", "Height (cm)": "128–134", "Chest (cm)": "64–68", "Waist (cm)": "58–60" },
        { size: "10-11Y", Age: "10–11 yrs", "Height (cm)": "140–146", "Chest (cm)": "70–74", "Waist (cm)": "62–64" },
        { size: "12-13Y", Age: "12–13 yrs", "Height (cm)": "152–158", "Chest (cm)": "76–80", "Waist (cm)": "65–68" },
      ],
    };
  }

  if (category === "Ladies") {
    return {
      headers: ["Size", "Chest (cm)", "Waist (cm)", "Hips (cm)"],
      rows: [
        { size: "XS", "Chest (cm)": "78–82", "Waist (cm)": "60–64", "Hips (cm)": "84–88" },
        { size: "S", "Chest (cm)": "82–86", "Waist (cm)": "64–68", "Hips (cm)": "88–92" },
        { size: "M", "Chest (cm)": "86–90", "Waist (cm)": "68–72", "Hips (cm)": "92–96" },
        { size: "L", "Chest (cm)": "90–96", "Waist (cm)": "72–78", "Hips (cm)": "96–102" },
        { size: "XL", "Chest (cm)": "96–102", "Waist (cm)": "78–84", "Hips (cm)": "102–108" },
      ],
    };
  }

  if (category === "Mens") {
    return {
      headers: ["Size", "Chest (cm)", "Waist (cm)", "Shoulder (cm)"],
      rows: [
        { size: "S", "Chest (cm)": "86–90", "Waist (cm)": "72–76", "Shoulder (cm)": "42–44" },
        { size: "M", "Chest (cm)": "90–96", "Waist (cm)": "76–82", "Shoulder (cm)": "44–46" },
        { size: "L", "Chest (cm)": "96–102", "Waist (cm)": "82–88", "Shoulder (cm)": "46–48" },
        { size: "XL", "Chest (cm)": "102–108", "Waist (cm)": "88–94", "Shoulder (cm)": "48–50" },
        { size: "XXL", "Chest (cm)": "108–114", "Waist (cm)": "94–100", "Shoulder (cm)": "50–52" },
      ],
    };
  }

  return null;
}

export function SizeGuideModal({ category, subcategory = "", onClose }: SizeGuideModalProps) {
  const spec = getGuideSpec(category, subcategory);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background w-full sm:max-w-lg sm:mx-4 border border-border shadow-xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            <h2 className="text-sm font-semibold uppercase tracking-widest">Size Guide</h2>
          </div>
          <button onClick={onClose} aria-label="Close size guide" className="p-1 hover:opacity-70 transition-opacity">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          {spec ? (
            <>
              <p className="text-xs text-muted-foreground mb-4">
                Measurements are approximate. If you're between sizes, we recommend sizing up.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      {spec.headers.map((h) => (
                        <th key={h} className="text-left py-2 pr-6 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {spec.rows.map((row) => (
                      <tr key={row.size} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                        {spec.headers.map((h) => (
                          <td key={h} className={`py-3 pr-6 ${h === spec.headers[0] ? "font-semibold" : "text-muted-foreground"}`}>
                            {row[h] ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 p-4 bg-secondary/50 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground uppercase tracking-wide text-[10px]">How to measure</p>
                {category !== "Footwear" && !["Sneakers","Formal Shoes","Sandals","Loafers","Heels","Boots","School Shoes"].includes(subcategory) && (
                  <>
                    <p><span className="font-medium text-foreground">Chest:</span> Measure around the fullest part of your chest, keeping the tape horizontal.</p>
                    <p><span className="font-medium text-foreground">Waist:</span> Measure around your natural waistline, the narrowest part of your torso.</p>
                    {category !== "Kids" && <p><span className="font-medium text-foreground">Hips:</span> Measure around the fullest part of your hips, about 20 cm below your waist.</p>}
                  </>
                )}
                {(category === "Footwear" || ["Sneakers","Formal Shoes","Sandals","Loafers","Heels","Boots","School Shoes"].includes(subcategory)) && (
                  <p><span className="font-medium text-foreground">Foot length:</span> Stand on paper, trace your foot, and measure from heel to longest toe.</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">This product is one size fits all.</p>
              <p className="text-xs mt-1">No size guide available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
