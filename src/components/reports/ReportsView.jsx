import React, { useState, useMemo } from 'react';
import PageHeader from '../common/PageHeader';
import StoreFilter from '../common/StoreFilter';
import DateFilter from '../common/DateFilter';
import StatCard from '../common/StatCard';
import DataTable from '../common/DataTable';
import { MOCK_REPORTS_DATA } from '../../data/mockReportsData';
import * as XLSX from 'xlsx';
import {
  Search,
  ChevronDown,
  Tag,
  TagX,
  AlertTriangle,
  TrendingDown,
  FileSpreadsheet,
  Printer,
  X,
} from 'lucide-react';

const ReportsView = () => {
  const [selectedStore, setSelectedStore] = useState('all');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('all'); // 'all' | 'Theft' | 'Untagged'
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const handleStoreChange = (storeId) => {
    setSelectedStore(storeId);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  // 1. Filter Logic
  const filteredData = useMemo(() => {
    return MOCK_REPORTS_DATA.filter((item) => {
      // Store filter
      if (selectedStore !== 'all' && item.storeCode !== selectedStore) {
        return false;
      }
      // Event Type filter
      if (selectedEventType !== 'all' && item.eventType !== selectedEventType) {
        return false;
      }
      // Search query filter (EPC, Article No, Description, Store Code, Store Name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchEpc = item.epc.toLowerCase().includes(query);
        const matchArtNo = item.articleNo.toLowerCase().includes(query);
        const matchDesc = item.articleDescription.toLowerCase().includes(query);
        const matchStoreCode = item.storeCode.toLowerCase().includes(query);
        const matchStoreName = item.storeName.toLowerCase().includes(query);
        return matchEpc || matchArtNo || matchDesc || matchStoreCode || matchStoreName;
      }
      return true;
    });
  }, [selectedStore, selectedEventType, searchQuery]);

  // 2. React DataTable Columns Definition
  const columns = useMemo(
    () => [
      {
        id: 'srNo',
        name: 'Sr No',
        selector: (row) => row.srNo,
        sortable: true,
        width: '75px',
        center: true,
        cell: (row) => <span className="font-semibold text-slate-800 text-[11px]">{row.srNo}</span>,
      },
      {
        id: 'date',
        name: 'Date',
        selector: (row) => row.timestamp,
        sortFunction: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        sortable: true,
        width: '110px',
        cell: (row) => <span className="font-semibold text-slate-800 text-[11px]">{row.date}</span>,
      },
      {
        id: 'storeCode',
        name: 'Store Code',
        selector: (row) => row.storeCode,
        sortable: true,
        width: '100px',
        center: true,
        cell: (row) => (
          <span className="font-semibold text-slate-800 text-[11px]">
            {row.storeCode}
          </span>
        ),
      },
      {
        id: 'storeName',
        name: 'Store Name',
        selector: (row) => row.storeName,
        sortable: true,
        minWidth: '130px',
        cell: (row) => <span className="font-semibold text-slate-800 text-[11px]">{row.storeName}</span>,
      },
      {
        id: 'epc',
        name: 'EPC Code',
        selector: (row) => row.epc,
        sortable: true,
        minWidth: '220px',
        cell: (row) => (
          <span className="font-mono text-slate-800 text-[11px] font-semibold select-all tracking-wider">
            {row.epc}
          </span>
        ),
      },
      {
        id: 'articleNo',
        name: 'Article No',
        selector: (row) => row.articleNo,
        sortable: true,
        width: '115px',
        cell: (row) => (
          <span className="font-mono text-slate-800 text-[11px] font-semibold">{row.articleNo}</span>
        ),
      },
      {
        id: 'articleDescription',
        name: 'Article Description',
        selector: (row) => row.articleDescription,
        sortable: true,
        minWidth: '220px',
        wrap: true,
        cell: (row) => (
          <span className="font-semibold text-slate-800 text-[11px] line-clamp-2" title={row.articleDescription}>
            {row.articleDescription}
          </span>
        ),
      },
      {
        id: 'qty',
        name: 'Qty',
        selector: (row) => row.qty,
        sortable: true,
        width: '70px',
        center: true,
        cell: (row) => (
          <span className="font-semibold text-slate-800 text-[11px]">
            {row.qty}
          </span>
        ),
      },
      {
        id: 'amount',
        name: 'Amount',
        selector: (row) => row.amount,
        sortable: true,
        width: '105px',
        right: true,
        cell: (row) => (
          <span className="font-semibold text-slate-800 text-[11px] tabular-nums">
            ₹{row.amount.toLocaleString('en-IN')}
          </span>
        ),
      },
      {
        id: 'eventType',
        name: 'Event Type',
        selector: (row) => row.eventType,
        sortable: true,
        width: '125px',
        center: true,
        cell: (row) => {
          const isTheft = row.eventType === 'Theft';
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl border border-slate-300 text-[11px] font-semibold text-slate-800 transition-colors ${
                isTheft
                  ? 'bg-rose-50'
                  : 'bg-sky-50'
              }`}
            >
              {isTheft ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 stroke-[2.2]" />
              ) : (
                <TagX className="w-3.5 h-3.5 text-[#00a8e7] shrink-0 stroke-[2.2]" />
              )}
              {row.eventType}
            </span>
          );
        },
      },
    ],
    []
  );

  // 3. Export Handlers
  const exportToExcel = () => {
    const exportData = filteredData.map((item, idx) => ({
      'Sr No': idx + 1,
      'Date': item.date,
      'Time': item.time,
      'Store Code': item.storeCode,
      'Store Name': item.storeName,
      'EPC Code': item.epc,
      'Article No': item.articleNo,
      'Article Description': item.articleDescription,
      'Qty': item.qty,
      'Amount (INR)': item.amount,
      'Event Type': item.eventType,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 14 },
      { wch: 8 },
      { wch: 12 },
      { wch: 18 },
      { wch: 28 },
      { wch: 14 },
      { wch: 32 },
      { wch: 8 },
      { wch: 14 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Security Incidents');
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `goods_security_report_${dateStr}.xlsx`);
    setExportMenuOpen(false);
  };


  const handlePrint = () => {
    setExportMenuOpen(false);
    // Slight delay to ensure dropdown is fully closed before opening browser print preview
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header with Store & Date Range Filters (Hidden on Print) */}
      <div className="no-print">
        <PageHeader title="Reports">
          <StoreFilter selectedStore={selectedStore} onStoreChange={handleStoreChange} />
          <DateFilter />
        </PageHeader>
      </div>

      {/* 2. Key Metrics Stat Cards (Hidden on Print) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <StatCard
          title="Total Tags"
          count="12,568"
          icon={Tag}
          variant="green"
          loading={loading}
        />
        <StatCard
          title="Untagged"
          count="315"
          icon={TagX}
          variant="blue"
          loading={loading}
        />
        <StatCard
          title="Theft Alerts"
          count="280"
          icon={AlertTriangle}
          variant="gray"
          loading={loading}
        />
        <StatCard
          title="Potential Loss"
          count="₹4,23,010"
          icon={TrendingDown}
          variant="rose"
          loading={loading}
        />
      </div>

      {/* 3. Printable Container (Contains Screen DataTable + Full Print Table) */}
      <div id="printable-report-area">
        {/* Print-Only Formal Header (Only visible in Print / Save to PDF output) */}
        <div className="hidden print:block mb-4 pb-3 border-b-2 border-slate-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Loss Prevention & Goods Security
              </h1>
            </div>
            <div className="text-right text-xs text-slate-600 space-y-0.5">
              <p>
                <span className="font-semibold text-slate-800">Generated:</span>{' '}
                {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Store Filter:</span>{' '}
                {selectedStore === 'all' ? 'All Stores Network' : selectedStore}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Total Records:</span>{' '}
                {filteredData.length} incidents
              </p>
            </div>
          </div>
        </div>

        {/* Screen Interactive React DataTable (Hidden during Print) */}
        <div className="print:hidden">
          <DataTable
            columns={columns}
            data={filteredData}
            keyField="id"
            pagination
            paginationPerPage={rowsPerPage}
            paginationRowsPerPageOptions={[10, 20, 50]}
            onChangeRowsPerPage={(newRpp) => setRowsPerPage(newRpp)}
            selectableRows={false}
            highlightOnHover
            pointerOnHover={false}
            progressPending={loading}
            subHeader
            subHeaderComponent={
              <div className="p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Left: Search Bar & Rows Dropdown Pill */}
                <div className="flex items-center gap-3 flex-1 flex-wrap sm:flex-nowrap">
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search by EPC, Article No, Description, Store..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:border-[#00a8e7] focus:ring-2 focus:ring-[#00a8e7]/15 transition-all text-slate-900 placeholder-slate-400 font-medium"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                        title="Clear Search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Rows Per Page Dropdown Pill (matching user screenshot) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs sm:text-sm text-slate-500 font-normal">Rows:</span>
                    <div className="relative inline-block">
                      <select
                        value={rowsPerPage}
                        onChange={(e) => setRowsPerPage(Number(e.target.value))}
                        className="appearance-none bg-white border border-slate-300 hover:border-slate-300 rounded-xl pl-3 pr-7 py-1 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-[#00a8e7] focus:ring-1 focus:ring-[#00a8e7]/20 cursor-pointer shadow-2xs transition-all"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-700 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2]" />
                    </div>
                  </div>
                </div>

                {/* Right: Event Type Segment Filters & Seamless Export Split Button */}
                <div className="flex items-center gap-2.5 self-end lg:self-auto flex-wrap">
                  {/* Event Type Filter Tabs */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => setSelectedEventType('all')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        selectedEventType === 'all'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All ({MOCK_REPORTS_DATA.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedEventType('Theft')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedEventType === 'Theft'
                          ? 'bg-rose-500 text-white shadow-2xs shadow-rose-500/25'
                          : 'text-slate-600 hover:text-rose-600'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      Theft
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedEventType('Untagged')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedEventType === 'Untagged'
                          ? 'bg-[#00a8e7] text-white shadow-2xs shadow-sky-500/25'
                          : 'text-slate-600 hover:text-[#00a8e7]'
                      }`}
                    >
                      <TagX className="w-3 h-3" />
                      Untagged
                    </button>
                  </div>

                  {/* Perfectly Aligned Split Export Dropdown Button */}
                  <div className="relative inline-flex items-stretch h-9 rounded-xl shadow-xs overflow-visible">
                    <div className="inline-flex items-stretch h-full rounded-xl overflow-hidden bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs shadow-emerald-600/20">
                      {/* Left: Main Action (Export to Excel) */}
                      <button
                        type="button"
                        onClick={exportToExcel}
                        className="h-full pl-3.5 pr-2.5 bg-transparent hover:bg-black/10 active:bg-black/20 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                        title="Download Excel (.xlsx)"
                      >
                        <FileSpreadsheet className="w-4 h-4 shrink-0" />
                        <span className="whitespace-nowrap">Export to Excel</span>
                      </button>

                      {/* Precise Vertical Divider Line */}
                      <div className="w-[1px] bg-white/25 self-stretch my-1.5" />

                      {/* Right: Dropdown Toggle Arrow */}
                      <button
                        type="button"
                        onClick={() => setExportMenuOpen(!exportMenuOpen)}
                        className="h-full px-2.5 bg-transparent hover:bg-black/10 active:bg-black/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="More export options"
                        aria-label="More export options"
                      >
                        <ChevronDown className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Dropdown Menu (Excel, Save to PDF / Print, CSV, JSON) */}
                    {exportMenuOpen && (
                      <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
                        <button
                          type="button"
                          onClick={exportToExcel}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Microsoft Excel (.xlsx)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handlePrint}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4 text-rose-600 shrink-0" />
                          <div className="flex flex-col">
                            <span>Save to PDF / Print</span>
                            <span className="text-[10px] text-slate-400 font-normal">Prints table only</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            }
          />
        </div>

        {/* Print-Only Full Table (Prints ALL filtered records across pages cleanly) */}
        <div className="hidden print:block w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-y border-slate-300 text-[10px] font-bold text-slate-800 uppercase">
                <th className="py-2 px-2 text-center w-10">Sr</th>
                <th className="py-2 px-2">Date</th>
                <th className="py-2 px-2 text-center">Store Code</th>
                <th className="py-2 px-2">Store Name</th>
                <th className="py-2 px-2 font-mono">EPC Code</th>
                <th className="py-2 px-2">Article No</th>
                <th className="py-2 px-2">Description</th>
                <th className="py-2 px-2 text-center">Qty</th>
                <th className="py-2 px-2 text-right">Amount</th>
                <th className="py-2 px-2 text-center">Event Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[9.5px] font-semibold text-slate-800">
              {filteredData.map((item, idx) => (
                <tr key={item.id || idx} className="border-b border-slate-200">
                  <td className="py-1.5 px-2 text-center text-slate-800">{idx + 1}</td>
                  <td className="py-1.5 px-2 text-slate-800">{item.date}</td>
                  <td className="py-1.5 px-2 text-center text-slate-800">{item.storeCode}</td>
                  <td className="py-1.5 px-2 text-slate-800">{item.storeName}</td>
                  <td className="py-1.5 px-2 font-mono text-[9px] text-slate-800">{item.epc}</td>
                  <td className="py-1.5 px-2 font-mono text-slate-800">{item.articleNo}</td>
                  <td className="py-1.5 px-2 text-slate-800">{item.articleDescription}</td>
                  <td className="py-1.5 px-2 text-center text-slate-800">{item.qty}</td>
                  <td className="py-1.5 px-2 text-right text-slate-800">₹{item.amount.toLocaleString('en-IN')}</td>
                  <td className="py-1.5 px-2 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-lg border border-slate-300 text-[9.5px] font-semibold text-slate-800 ${
                        item.eventType === 'Theft' ? 'bg-rose-50' : 'bg-sky-50'
                      }`}
                    >
                      {item.eventType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
