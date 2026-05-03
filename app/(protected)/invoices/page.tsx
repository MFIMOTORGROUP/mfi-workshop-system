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

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>Invoice No</th>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {invoices?.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.invoice_number}</td>
              <td>{inv.customer_name}</td>
              <td>{inv.vehicle}</td>
              <td>£{inv.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}