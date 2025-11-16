import React, { useState, useEffect, useMemo } from "react";
import {
  documentAPI,
  clientAPI,
  caseAPI,
  selectFile,
  copyDocumentFile,
  openDocumentFile,
} from "../utils/api";
import { showSuccess, showError } from "../utils/toast";
import { useConfirm } from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";

function DocumentModal({ document, onClose, onSave }) {
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    documentType: "other",
    filePath: "",
    fileName: "",
    fileSize: 0,
    notes: "",
    clientId: "",
    caseId: "",
    ...document,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter cases when clientId changes
    if (formData.clientId) {
      const clientCases = cases.filter(
        (c) => c.clientId === parseInt(formData.clientId)
      );
      setFilteredCases(clientCases);

      // Reset caseId if the selected case doesn't belong to the new client
      const currentCaseValid = clientCases.some(
        (c) => c.id === parseInt(formData.caseId)
      );
      if (!currentCaseValid && formData.caseId) {
        setFormData({ ...formData, caseId: "" });
      }
    } else {
      setFilteredCases([]);
      if (formData.caseId) {
        setFormData({ ...formData, caseId: "" });
      }
    }
  }, [formData.clientId, cases]);

  const loadData = async () => {
    const [clientsResult, casesResult] = await Promise.all([
      clientAPI.getAll(),
      caseAPI.getAll(),
    ]);
    if (clientsResult.success) setClients(clientsResult.data);
    if (casesResult.success) setCases(casesResult.data);
  };

  const handleSelectFile = async () => {
    try {
      const result = await selectFile();
      if (result.success && result.data) {
        setSelectedFile(result.data);
        setFormData({
          ...formData,
          fileName: result.data.fileName,
          fileSize: result.data.fileSize,
        });
      }
    } catch (error) {
      console.log(error);
      showError("فشل في اختيار الملف");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that client and case are selected for file copying
    if (selectedFile && (!formData.clientId || !formData.caseId)) {
      showError("يجب اختيار الموكل والقضية عند رفع ملف");
      return;
    }

    let finalFormData = { ...formData };

    // If a file was selected, copy it to the documents folder
    if (selectedFile && formData.clientId && formData.caseId) {
      try {
        // Get client and case names for folder structure
        const client = clients.find(
          (c) => c.id === parseInt(formData.clientId)
        );
        const caseData = cases.find((c) => c.id === parseInt(formData.caseId));

        if (!client || !caseData) {
          showError("لم يتم العثور على بيانات الموكل أو القضية");
          return;
        }

        const clientName =
          client.type === "company"
            ? client.companyName
            : `${client.firstName}_${client.lastName}`;
        const caseNumber = caseData.caseNumber;

        // Copy file to organized folder structure
        const copyResult = await copyDocumentFile(
          selectedFile.filePath,
          clientName,
          caseNumber,
          formData.title
        );

        if (copyResult.success && copyResult.data) {
          finalFormData.filePath = copyResult.data.filePath;
          finalFormData.fileName = copyResult.data.fileName;
          finalFormData.fileSize = copyResult.data.fileSize;
        } else {
          showError("فشل في نسخ الملف: " + copyResult.error);
          return;
        }
      } catch (error) {
        showError("حدث خطأ أثناء نسخ الملف");
        return;
      }
    }

    onSave(finalFormData);
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
                  disabled={!formData.clientId}
                >
                  <option value="">
                    {formData.clientId
                      ? "اختر القضية"
                      : "اختر الموكل أولاً"}
                  </option>
                  {filteredCases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">اختيار الملف</label>
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleSelectFile}
                >
                  📎 اختيار ملف
                </button>
                {selectedFile && (
                  <span style={{ color: "#28a745", fontSize: "14px" }}>
                    ✓ {selectedFile.fileName} (
                    {Math.round(selectedFile.fileSize / 1024)} KB)
                  </span>
                )}
              </div>
              <small
                style={{
                  color: "#666",
                  fontSize: "12px",
                  marginTop: "5px",
                  display: "block",
                }}
              >
                سيتم حفظ الملف في: documents/اسم_الموكل/رقم_القضية/عنوان_المستند
              </small>
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
            : "تم إضافة المستند بنجاح"
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

  const handleOpenFile = async (filePath) => {
    if (!filePath) {
      showError("لا يوجد ملف مرتبط بهذا المستند");
      return;
    }
    try {
      const result = await openDocumentFile(filePath);
      console.log(result);
      if (!result.success) {
        showError("فشل في فتح الملف");
      }
    } catch (error) {
      showError("حدث خطأ أثناء فتح الملف");
    }
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
        accessorKey: "client",
        header: "الموكل",
        cell: ({ row }) => {
          const client = row.original.client;
          if (!client) return "-";
          return client.type === "company"
            ? client.companyName
            : `${client.firstName} ${client.lastName}`;
        },
        enableSorting: false,
      },
      {
        accessorKey: "case",
        header: "القضية",
        cell: ({ row }) => {
          const caseData = row.original.case;
          return caseData ? `${caseData.caseNumber}` : "-";
        },
        enableSorting: false,
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
            {row.original.filePath && (
              <button
                className="btn btn-sm btn-success"
                onClick={() => handleOpenFile(row.original.filePath)}
                title="فتح الملف"
              >
                📄 فتح
              </button>
            )}
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
    []
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
