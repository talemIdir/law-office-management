import React, { useState, useEffect, useMemo } from "react";
import { documentAPI, clientAPI, caseAPI } from "../utils/api";
import { showSuccess, showError } from "../utils/toast";
import { useConfirm } from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";

function DocumentModal({ document, onClose, onSave }) {
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    documentType: "other",
    filePath: "",
    fileName: "",
    notes: "",
    clientId: "",
    caseId: "",
    ...document,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [clientsResult, casesResult] = await Promise.all([
      clientAPI.getAll(),
      caseAPI.getAll(),
    ]);
    if (clientsResult.success) setClients(clientsResult.data);
    if (casesResult.success) setCases(casesResult.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {document ? "تعديل بيانات مستند" : "إضافة مستند جديد"}
          </h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label required">عنوان المستند</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">وصف المستند</label>
              <textarea
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label required">نوع المستند</label>
              <select
                name="documentType"
                className="form-select"
                value={formData.documentType}
                onChange={handleChange}
                required
              >
                <option value="contract">عقد</option>
                <option value="court_filing">صك محكمة</option>
                <option value="evidence">دليل</option>
                <option value="correspondence">مراسلة</option>
                <option value="id_document">وثيقة هوية</option>
                <option value="power_of_attorney">توكيل</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">الموكل</label>
                <select
                  name="clientId"
                  className="form-select"
                  value={formData.clientId}
                  onChange={handleChange}
                >
                  <option value="">اختر الموكل</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.type === "company"
                        ? client.companyName
                        : `${client.firstName} ${client.lastName}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">القضية</label>
                <select
                  name="caseId"
                  className="form-select"
                  value={formData.caseId}
                  onChange={handleChange}
                >
                  <option value="">اختر القضية</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">اسم الملف</label>
                <input
                  type="text"
                  name="fileName"
                  className="form-control"
                  value={formData.fileName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">مسار الملف</label>
                <input
                  type="text"
                  name="filePath"
                  className="form-control"
                  value={formData.filePath}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ملاحظات</label>
              <textarea
                name="notes"
                className="form-textarea"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              {document ? "حفظ التعديلات" : "إضافة مستند"}
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const confirm = useConfirm();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    const result = await documentAPI.getAll();
    if (result.success) {
      setDocuments(result.data);
    }
    setLoading(false);
  };

  const handleSave = async (formData) => {
    try {
      let result;
      if (selectedDocument) {
        result = await documentAPI.update(selectedDocument.id, formData);
      } else {
        result = await documentAPI.create(formData);
      }

      if (result.success) {
        setShowModal(false);
        setSelectedDocument(null);
        loadDocuments();
        showSuccess(
          selectedDocument
            ? "تم تحديث بيانات المستند بنجاح"
            : "تم إضافة المستند بنجاح",
        );
      } else {
        showError("خطأ: " + result.error);
      }
    } catch (error) {
      showError("حدث خطأ أثناء حفظ البيانات");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "تأكيد الحذف",
      message: "هل أنت متأكد من حذف هذا المستند؟",
      confirmText: "نعم، احذف",
      cancelText: "إلغاء",
    });

    if (confirmed) {
      const result = await documentAPI.delete(id);
      if (result.success) {
        loadDocuments();
        showSuccess("تم حذف المستند بنجاح");
      } else {
        showError("خطأ: " + result.error);
      }
    }
  };

  const handleEdit = (document) => {
    setSelectedDocument(document);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedDocument(null);
    setShowModal(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("ar-DZ");
  };

  const globalFilterFn = (doc, searchTerm) => {
    return (
      doc.title.includes(searchTerm) ||
      (doc.fileName && doc.fileName.includes(searchTerm)) ||
      (doc.description && doc.description.includes(searchTerm))
    );
  };

  const filteredByType = useMemo(() => {
    if (filterType === "all") return documents;
    return documents.filter((d) => d.documentType === filterType);
  }, [documents, filterType]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "عنوان المستند",
        enableSorting: true,
      },
      {
        accessorKey: "documentType",
        header: "النوع",
        cell: ({ row }) => (
          <span className="badge badge-secondary">
            {row.original.documentType === "contract" && "عقد"}
            {row.original.documentType === "court_filing" && "صك محكمة"}
            {row.original.documentType === "evidence" && "دليل"}
            {row.original.documentType === "correspondence" && "مراسلة"}
            {row.original.documentType === "id_document" && "وثيقة هوية"}
            {row.original.documentType === "power_of_attorney" && "توكيل"}
            {row.original.documentType === "other" && "أخرى"}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "fileName",
        header: "اسم الملف",
        cell: ({ row }) => row.original.fileName || "-",
        enableSorting: true,
      },
      {
        accessorKey: "uploadDate",
        header: "تاريخ الرفع",
        cell: ({ row }) =>
          formatDate(row.original.uploadDate || row.original.createdAt),
        enableSorting: true,
      },
      {
        id: "actions",
        header: "الإجراءات",
        cell: ({ row }) => (
          <div className="action-buttons">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleEdit(row.original)}
            >
              ✏️ تعديل
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDelete(row.original.id)}
            >
              🗑️ حذف
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [],
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">إدارة المستندات</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          ➕ إضافة مستند جديد
        </button>
      </div>

      <div className="card">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 البحث عن مستند..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            style={{ width: "200px" }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">جميع الأنواع</option>
            <option value="contract">عقد</option>
            <option value="court_filing">صك محكمة</option>
            <option value="evidence">دليل</option>
            <option value="correspondence">مراسلة</option>
            <option value="id_document">وثيقة هوية</option>
            <option value="power_of_attorney">توكيل</option>
            <option value="other">أخرى</option>
          </select>
        </div>

        <DataTable
          data={filteredByType}
          columns={columns}
          searchTerm={searchTerm}
          filterValue=""
          filterKey=""
          globalFilterFn={globalFilterFn}
          pageSize={10}
          showPagination={true}
          emptyMessage={
            searchTerm || filterType !== "all"
              ? "لم يتم العثور على مستندات مطابقة للبحث"
              : "لم يتم إضافة أي مستندات بعد"
          }
        />
      </div>

      {showModal && (
        <DocumentModal
          document={selectedDocument}
          onClose={() => {
            setShowModal(false);
            setSelectedDocument(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default DocumentsPage;
