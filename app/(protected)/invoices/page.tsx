import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function InvoicesPage() {
  const { data: sales } = await supabase
    .from("sales_invoices")
    .select("*");

  return (
    <div style={{ padding: "20px" }}>
      <h1>Sales Invoices</h1>

      <button
        style={{
          marginBottom: "20px",
          padding: "10px 15px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        + Create Sale Invoice
      </button>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Buyer</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Sale Price</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Deposit</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Balance</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {sales?.map((s) => (
            <tr key={s.id}>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {s.buyer_name}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                £{s.sale_price}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                £{s.deposit}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                £{s.balance}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                {s.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}