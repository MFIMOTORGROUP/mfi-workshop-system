import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function InvoicesPage() {
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("*");

  if (error) {
    console.log(error);
    return <div>Error loading invoices</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Invoices</h1>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Invoice No</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Customer</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Vehicle</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {invoices?.map((inv) => (
            <tr key={inv.id}>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {inv.invoice_number}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {inv.customer_name}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {inv.vehicle}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                £{inv.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}