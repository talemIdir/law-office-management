import React, { useState, useEffect, useMemo } from "react";
import { jurisdictionAPI } from "../utils/api";
import DataTable from "../components/DataTable";
import { toast } from "react-toastify";

const CourtsDirectory = () => {
  const [councils, setCouncils] = useState([]);
  const [firstDegreeCourts, setFirstDegreeCourts] = useState([]);
  const [administrativeCourts, setAdministrativeCourts] = useState([]);
  const [commercialCourts, setCommercialCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("councils"); // councils, first-degree, administrative, commercial
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCouncil, setSelectedCouncil] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [councilsRes, firstDegreeRes, adminRes, commercialRes] =
        await Promise.all([
          jurisdictionAPI.getAllJudicialCouncils(),
          jurisdictionAPI.getAllFirstDegreeCourts(),
          jurisdictionAPI.getAllAdministrativeCourts(),
          jurisdictionAPI.getAllCommercialCourts(),
        ]);

      if (councilsRes.success) {
        setCouncils(councilsRes.data);
      } else {
        toast.error("فشل في تحميل المجالس القضائية");
      }

      if (firstDegreeRes.success) {
        setFirstDegreeCourts(firstDegreeRes.data);
      } else {
        toast.error("فشل في تحميل المحاكم");
      }

      if (adminRes.success) {
        setAdministrativeCourts(adminRes.data);
      } else {
        toast.error("فشل في تحميل المحاكم الإدارية");
      }

      if (commercialRes.success) {
        setCommercialCourts(commercialRes.data);
      } else {
        toast.error("فشل في تحميل المحاكم التجارية");
      }
    } catch (error) {
      console.error("Error loading courts data:", error);
      toast.error("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search term
  const filteredCouncils = useMemo(() => {
    return councils.filter(
      (council) =>
        council.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (council.phone && council.phone.includes(searchTerm)) ||
        (council.email &&
          council.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [councils, searchTerm]);

  const filteredFirstDegreeCourts = useMemo(() => {
    return firstDegreeCourts.filter((court) => {
      const matchesSearch = court.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCouncil =
        !selectedCouncil || court.councilId === parseInt(selectedCouncil);
      return matchesSearch && matchesCouncil;
    });
  }, [firstDegreeCourts, searchTerm, selectedCouncil]);

  const filteredAdministrativeCourts = useMemo(() => {
    return administrativeCourts.filter((court) =>
      court.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [administrativeCourts, searchTerm]);

  const filteredCommercialCourts = useMemo(() => {
    return commercialCourts.filter(
      (court) =>
        court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (court.jurisdictionDetails &&
          court.jurisdictionDetails
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    );
  }, [commercialCourts, searchTerm]);

  // Columns for Judicial Councils
  const councilColumns = [
    {
      header: "اسم المجلس القضائي",
      accessor: "name",
      sortable: true,
      cell: ({ row }) => row.original.name || "-",
    },
    {
      header: "الهاتف",
      accessor: "phone",
      sortable: true,
      cell: ({ row }) => row.original.phone || "-",
    },
    {
      header: "البريد الإلكتروني",
      accessor: "email",
      sortable: true,
      cell: ({ row }) =>
        row.original.email ? (
          <a href={`mailto:${row.original.email}`} className="text-link">
            {row.original.email}
          </a>
        ) : (
          "-"
        ),
    },
    {
      header: "الموقع الإلكتروني",
      accessor: "website",
      sortable: true,
      cell: ({ row }) =>
        row.original.website ? (
          <a
            href={row.original.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            زيارة الموقع
          </a>
        ) : (
          "-"
        ),
    },
    {
      header: "العنوان",
      accessor: "address",
      sortable: true,
      cell: ({ row }) => row.original.address || "-",
    },
    {
      header: "أيام الاستقبال",
      accessor: "receptionDays",
      cell: ({ row }) =>
        row.original.receptionDays ? (
          <div className="reception-days">{row.original.receptionDays}</div>
        ) : (
          "-"
        ),
    },
  ];

  // Columns for First Degree Courts
  const firstDegreeColumns = [
    {
      header: "اسم المحكمة",
      accessor: "name",
      sortable: true,
      cell: ({ row }) => row.original.name || "-",
    },
    {
      header: "المجلس القضائي",
      accessor: "councilId",
      sortable: true,
      cell: ({ row }) => {
        const council = councils.find((c) => c.id === row.original.councilId);
        return council ? council.name : "-";
      },
    },
    {
      header: "النوع",
      accessor: "isBranch",
      sortable: true,
      cell: ({ row }) => (
        <span
          className={`badge ${row.original.isBranch ? "badge-warning" : "badge-primary"}`}
        >
          {row.original.isBranch ? "ملحقة" : "عادية"}
        </span>
      ),
    },
  ];

  // Columns for Administrative Courts
  const administrativeColumns = [
    {
      header: "اسم المحكمة الإدارية",
      accessor: "name",
      sortable: true,
      cell: ({ row }) => row.original.name || "-",
    },
    {
      header: "محكمة الاستئناف التابعة",
      accessor: "appealCourtId",
      sortable: true,
      cell: ({ row }) => {
        if (!row.original.appealCourt.name) return "-";
        return row.original.appealCourt.name;
      },
    },
  ];

  // Columns for Commercial Courts
  const commercialColumns = [
    {
      header: "اسم المحكمة التجارية المتخصصة",
      accessor: "name",
      sortable: true,
      cell: ({ row }) => row.original.name || "-",
    },
    {
      header: "تفاصيل الاختصاص الإقليمي",
      accessor: "jurisdictionDetails",
      cell: ({ row }) => row.original.jurisdictionDetails || "-",
    },
  ];

  const getCurrentData = () => {
    switch (viewMode) {
      case "councils":
        return filteredCouncils;
      case "first-degree":
        return filteredFirstDegreeCourts;
      case "administrative":
        return filteredAdministrativeCourts;
      case "commercial":
        return filteredCommercialCourts;
      default:
        return [];
    }
  };

  const getCurrentColumns = () => {
    switch (viewMode) {
      case "councils":
        return councilColumns;
      case "first-degree":
        return firstDegreeColumns;
      case "administrative":
        return administrativeColumns;
      case "commercial":
        return commercialColumns;
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">فهرس المحاكم</h1>
      </div>

      <div className="card">
        {/* Summary Statistics */}
        <div className="courts-stats">
          <div className="stat-card">
            <div className="stat-label">المجالس القضائية</div>
            <div className="stat-value">{councils.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">المحاكم الابتدائية</div>
            <div className="stat-value">{firstDegreeCourts.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">المحاكم الإدارية</div>
            <div className="stat-value">{administrativeCourts.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">المحاكم التجارية</div>
            <div className="stat-value">{commercialCourts.length}</div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="courts-tabs">
          <button
            className={`tab-btn ${viewMode === "councils" ? "active" : ""}`}
            onClick={() => {
              setViewMode("councils");
              setSearchTerm("");
              setSelectedCouncil("");
            }}
          >
            المجالس القضائية ({councils.length})
          </button>
          <button
            className={`tab-btn ${viewMode === "first-degree" ? "active" : ""}`}
            onClick={() => {
              setViewMode("first-degree");
              setSearchTerm("");
            }}
          >
            المحاكم الابتدائية ({firstDegreeCourts.length})
          </button>
          <button
            className={`tab-btn ${viewMode === "administrative" ? "active" : ""}`}
            onClick={() => {
              setViewMode("administrative");
              setSearchTerm("");
              setSelectedCouncil("");
            }}
          >
            المحاكم الإدارية ({administrativeCourts.length})
          </button>
          <button
            className={`tab-btn ${viewMode === "commercial" ? "active" : ""}`}
            onClick={() => {
              setViewMode("commercial");
              setSearchTerm("");
              setSelectedCouncil("");
            }}
          >
            المحاكم التجارية ({commercialCourts.length})
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="search-container">
          <div className="search-group">
            <input
              type="text"
              className="form-control"
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="btn btn-outline btn-small"
                onClick={() => setSearchTerm("")}
              >
                مسح
              </button>
            )}
          </div>

          {viewMode === "first-degree" && (
            <div className="filter-group">
              <select
                className="form-select"
                value={selectedCouncil}
                onChange={(e) => setSelectedCouncil(e.target.value)}
              >
                <option value="">جميع المجالس القضائية</option>
                {councils.map((council) => (
                  <option key={council.id} value={council.id}>
                    {council.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Data Table */}
        <DataTable
          data={getCurrentData()}
          columns={getCurrentColumns()}
          itemsPerPage={20}
        />
      </div>
    </div>
  );
};

export default CourtsDirectory;
