import "./DataTable.css";

function DataTable({ columns, rows, rowKey, emptyMessage }) {
    const keyField = rowKey || "id";
    const emptyText = emptyMessage || "אין נתונים להצגה";

    if (!rows || rows.length === 0) {
        return (
            <div className="data-table-empty">
                {emptyText}
            </div>
        );
    }

    return (
        <div className="data-table-wrapper">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map(function(col) {
                            return <th key={col.key}>{col.label}</th>;
                        })}
                    </tr>
                </thead>

                <tbody>
                    {rows.map(function(row) {
                        return (
                            <tr key={row[keyField]}>
                                {columns.map(function(col) {
                                    const value = row[col.key];
                                    // use render() if column gave one, otherwise just show the value
                                    const cell = col.render
                                        ? col.render(value, row)
                                        : (value === undefined || value === null ? "—" : String(value));
                                    return <td key={col.key}>{cell}</td>;
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
