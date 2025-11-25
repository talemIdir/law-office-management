import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { caseAPI, clientAPI, paymentAPI } from "../utils/api";
import { showSuccess, showError } from "../utils/toast";
import { useConfirm } from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import PaymentModal from "../components/PaymentModal";
import AdvancedFilter from "../components/AdvancedFilter";
import { useAuth } from "../contexts/AuthContext";
import {
  getStatusLabel,
  getCaseTypeLabel,
  getPriorityLabel,
  getJurisdictionTypeLabel,
} from "../utils/labels";

function CaseModal({ caseData, onClose, onSave }) {
  const { user } = useAuth();
  const clientDropdownRef = useRef(null);
  const [clients, setClients] = useState([]);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [judicialCouncils, setJudicialCouncils] = useState([]);
  const [administrativeAppealCourts, setAdministrativeAppealCourts] = useState(
    []
  );
  const [commercialCourts, setCommercialCourts] = useState([]);
  const [supremeChambers, setSupremeChambers] = useState([]);
  const [stateCouncilChambers, setStateCouncilChambers] = useState([]);
  const [courts, setCourts] = useState([]);
  const [formData, setFormData] = useState({
    caseNumber: "",
    title: "",
    description: "",
    caseType: "civil",
    jurisdictionType: "",
    ordinaryJurisdictionType: "",
    administrativeJurisdictionType: "",
    judicialCouncilId: "",
    supremeCourtId: "",
    supremeChamberId: "",
    stateCouncilId: "",
    stateCouncilChamberId: "",
    administrativeAppealCourtId: "",
    courtId: "",
    courtName: "",
    judge: "",
    opposingParty: "",
    opposingLawyer: "",
    clientRole: "plaintiff",
    status: "first_instance",
    priority: "normal",
    startDate: "",
    amount: "",
    notes: "",
    clientId: "",
    ...caseData,
  });

  useEffect(() => {
    loadClients();
    loadJurisdictionalData();
  }, []);

  useEffect(() => {
    // Set initial search term when editing a case
    if (caseData && caseData.clientId && clients.length > 0) {
      const selectedClient = clients.find(c => c.id === caseData.clientId);
      if (selectedClient) {
        const displayName = selectedClient.type === "company"
          ? selectedClient.companyName
          : `${selectedClient.firstName} ${selectedClient.lastName}`;
        setClientSearchTerm(displayName);
      }
    }
  }, [caseData, clients]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target)) {
        setShowClientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (formData.jurisdictionType) {
      loadCourtsForJurisdiction();
    }
  }, [
    formData.jurisdictionType,
    formData.ordinaryJurisdictionType,
    formData.administrativeJurisdictionType,
    formData.judicialCouncilId,
    formData.administrativeAppealCourtId,
  ]);

  const loadClients = async () => {
    const result = await clientAPI.getAll({ where: { status: "active" } });
    if (result.success) {
      setClients(result.data);
    }
  };

  const loadJurisdictionalData = async () => {
    const { ipcRenderer } = window.require("electron");

    // Load judicial councils (for ordinary jurisdiction)
    const councilsResult = await ipcRenderer.invoke(
      "jurisdiction:getAllJudicialCouncils"
    );
    if (councilsResult.success) {
      setJudicialCouncils(councilsResult.data);
    }

    // Load Supreme Court chambers
    const supremeChambersResult = await ipcRenderer.invoke(
      "jurisdiction:getSupremeChambers"
    );
    if (supremeChambersResult.success) {
      setSupremeChambers(supremeChambersResult.data);
    }

    // Load State Council chambers
    const stateCouncilChambersResult = await ipcRenderer.invoke(
      "jurisdiction:getStateCouncilChambers"
    );
    if (stateCouncilChambersResult.success) {
      setStateCouncilChambers(stateCouncilChambersResult.data);
    }

    // Load administrative appeal courts
    const adminAppealResult = await ipcRenderer.invoke(
      "jurisdiction:getAllAdministrativeAppealCourts"
    );
    if (adminAppealResult.success) {
      setAdministrativeAppealCourts(adminAppealResult.data);
    }

    // Load commercial courts
    const commercialResult = await ipcRenderer.invoke(
      "jurisdiction:getAllCommercialCourts"
    );
    if (commercialResult.success) {
      setCommercialCourts(commercialResult.data);
    }
  };

  const loadCourtsForJurisdiction = async () => {
    const { ipcRenderer } = window.require("electron");

    if (
      formData.jurisdictionType === "ordinary" &&
      formData.judicialCouncilId
    ) {
      // Load first degree courts for selected judicial council
      const result = await ipcRenderer.invoke(
        "jurisdiction:getCourtsByCouncilId",
        parseInt(formData.judicialCouncilId)
      );
      if (result.success) {
        setCourts(result.data);
      }
    } else if (
      formData.jurisdictionType === "administrative" &&
      formData.administrativeAppealCourtId
    ) {
      // Load administrative courts for selected appeal court
      const result = await ipcRenderer.invoke(
        "jurisdiction:getAdminCourtsByAppealCourtId",
        parseInt(formData.administrativeAppealCourtId)
      );
      if (result.success) {
        setCourts(result.data);
      }
    } else if (formData.jurisdictionType === "commercial") {
      // Commercial courts don't have a hierarchy, just show the list
      setCourts(commercialCourts);
    } else {
      setCourts([]);
    }
  };

  const filteredClients = useMemo(() => {
    if (!clientSearchTerm) return clients.slice(0, 10); // Show first 10 clients when empty

    const searchLower = clientSearchTerm.toLowerCase();
    return clients.filter(client => {
      const displayName = client.type === "company"
        ? client.companyName
        : `${client.firstName} ${client.lastName}`;
      return displayName.toLowerCase().includes(searchLower);
    }).slice(0, 10); // Show max 10 results
  }, [clients, clientSearchTerm]);

  const handleClientSearch = (e) => {
    const value = e.target.value;
    setClientSearchTerm(value);
    setShowClientDropdown(true);

    // Clear clientId if search term is cleared
    if (!value) {
      setFormData({ ...formData, clientId: "" });
    }
  };

  const handleClientSelect = (client) => {
    const displayName = client.type === "company"
      ? client.companyName
      : `${client.firstName} ${client.lastName}`;
    setClientSearchTerm(displayName);
    setFormData({ ...formData, clientId: client.id });
    setShowClientDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If jurisdiction type changes, reset related fields
    if (name === "jurisdictionType") {
      setFormData({
        ...formData,
        jurisdictionType: value,
        ordinaryJurisdictionType: "",
        administrativeJurisdictionType: "",
        judicialCouncilId: "",
        supremeCourtId: "",
        supremeChamberId: "",
        stateCouncilId: "",
        stateCouncilChamberId: "",
        administrativeAppealCourtId: "",
        courtId: "",
        courtName: "",
      });
      setCourts([]);
    }
    // If ordinary jurisdiction type changes, reset related fields
    else if (name === "ordinaryJurisdictionType") {
      setFormData({
        ...formData,
        ordinaryJurisdictionType: value,
        judicialCouncilId: "",
        supremeCourtId: "",
        supremeChamberId: "",
        courtId: "",
        courtName: "",
      });
      setCourts([]);
    }
    // If administrative jurisdiction type changes, reset related fields
    else if (name === "administrativeJurisdictionType") {
      setFormData({
        ...formData,
        administrativeJurisdictionType: value,
        administrativeAppealCourtId: "",
        stateCouncilId: "",
        stateCouncilChamberId: "",
        courtId: "",
        courtName: "",
      });
      setCourts([]);
    }
    // If council/appeal court changes, reset court selection
    else if (
      name === "judicialCouncilId" ||
      name === "administrativeAppealCourtId"
    ) {
      setFormData({
        ...formData,
        [name]: value,
        courtId: "",
        courtName: "",
      });
    }
    // If court is selected, save its name for display
    else if (name === "courtId") {
      const selectedCourt = courts.find((c) => c.id === parseInt(value));
      setFormData({
        ...formData,
        courtId: value,
        courtName: selectedCourt ? selectedCourt.name : "",
      });
    }
    // If Supreme Chamber is selected, set supremeCourtId
    else if (name === "supremeChamberId") {
      setFormData({
        ...formData,
        supremeChamberId: value,
        supremeCourtId: value ? 1 : "", // There's only one Supreme Court with ID 1
      });
    }
    // If State Council Chamber is selected, set stateCouncilId
    else if (name === "stateCouncilChamberId") {
      setFormData({
        ...formData,
        stateCouncilChamberId: value,
        stateCouncilId: value ? 1 : "", // There's only one State Council with ID 1
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "900px" }}
      >
        <div className="modal-header">
          <h3 className="modal-title">
            {caseData ? "تعديل بيانات قضية" : "إضافة قضية جديدة"}
          </h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">رقم القضية</label>
                <input
                  type="text"
                  name="caseNumber"
                  className="form-control"
                  value={formData.caseNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group" style={{ position: 'relative' }} ref={clientDropdownRef}>
                <label className="form-label required">الموكل</label>
                <input
                  type="text"
                  className="form-control"
                  value={clientSearchTerm}
                  onChange={handleClientSearch}
                  onFocus={() => setShowClientDropdown(true)}
                  placeholder="ابحث عن الموكل..."
                  required
                  autoComplete="off"
                />
                {showClientDropdown && filteredClients.length > 0 && (
                  <div
                    className="client-dropdown"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className="client-dropdown-item"
                        onClick={() => handleClientSelect(client)}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        {client.type === "company"
                          ? client.companyName
                          : `${client.firstName} ${client.lastName}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">عنوان القضية</label>
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
              <label className="form-label">وصف القضية</label>
              <textarea
                name="description"
                className="form-textarea"
                value={formData.description || ""}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">نوع القضية</label>
                <select
                  name="caseType"
                  className="form-select"
                  value={formData.caseType}
                  onChange={handleChange}
                  required
                >
                  <option value="civil">المدني</option>
                  <option value="social">الإجتماعي</option>
                  <option value="real_estate">العقاري</option>
                  <option value="family">شؤون الأسرة</option>
                  <option value="commercial">التجاري</option>
                  <option value="maritime">البحري</option>
                  <option value="urgent">الاستعجالي</option>
                  <option value="misdemeanor">الجنح</option>
                  <option value="violations">المخالفات</option>
                  <option value="juveniles">الأحداث</option>
                  <option value="penalty_enforcement">تطبيق العقوبات</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label required">صفة الموكل</label>
                <select
                  name="clientRole"
                  className="form-select"
                  value={formData.clientRole}
                  onChange={handleChange}
                  required
                >
                  <option value="plaintiff">مدعي</option>
                  <option value="defendant">مدعى عليه</option>
                  <option value="intervening_party">مدخل في الخصام</option>
                  <option value="respondent_after_expertise">مرجع بعد الخبرة</option>
                  <option value="appellant_after_expertise">مرجع عليه بعد الخبرة</option>
                  <option value="appellant">الطاعن</option>
                  <option value="respondent">المطعون ضده</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">نوع القضاء</label>
              <select
                name="jurisdictionType"
                className="form-select"
                value={formData.jurisdictionType}
                onChange={handleChange}
              >
                <option value="">اختر نوع القضاء</option>
                <option value="ordinary">القضاء العادي</option>
                <option value="administrative">القضاء الإداري</option>
                <option value="commercial">القضاء التجاري المتخصص</option>
              </select>
            </div>

            {formData.jurisdictionType === "ordinary" && (
              <>
                <div className="form-group">
                  <label className="form-label">نوع المحكمة</label>
                  <select
                    name="ordinaryJurisdictionType"
                    className="form-select"
                    value={formData.ordinaryJurisdictionType}
                    onChange={handleChange}
                  >
                    <option value="">اختر نوع المحكمة</option>
                    <option value="judicial_council">المجلس القضائي</option>
                    <option value="supreme_court">المحكمة العليا</option>
                  </select>
                </div>

                {formData.ordinaryJurisdictionType === "judicial_council" && (
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">المجلس القضائي</label>
                      <select
                        name="judicialCouncilId"
                        className="form-select"
                        value={formData.judicialCouncilId}
                        onChange={handleChange}
                      >
                        <option value="">اختر المجلس القضائي</option>
                        {judicialCouncils.map((council) => (
                          <option key={council.id} value={council.id}>
                            {council.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {formData.judicialCouncilId && (
                      <div className="form-group">
                        <label className="form-label">المحكمة</label>
                        <select
                          name="courtId"
                          className="form-select"
                          value={formData.courtId}
                          onChange={handleChange}
                        >
                          <option value="">اختر المحكمة</option>
                          {courts.map((court, index) => (
                            <option
                              key={`ordinary-court-${court.id || index}`}
                              value={court.id}
                            >
                              {court.name} {court.isBranch ? "(فرع)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {formData.ordinaryJurisdictionType === "supreme_court" && (
                  <div className="form-group">
                    <label className="form-label">غرفة المحكمة العليا</label>
                    <select
                      name="supremeChamberId"
                      className="form-select"
                      value={formData.supremeChamberId}
                      onChange={handleChange}
                    >
                      <option value="">اختر الغرفة</option>
                      {supremeChambers.map((chamber) => (
                        <option key={chamber.id} value={chamber.id}>
                          {chamber.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {formData.jurisdictionType === "administrative" && (
              <>
                <div className="form-group">
                  <label className="form-label">نوع المحكمة</label>
                  <select
                    name="administrativeJurisdictionType"
                    className="form-select"
                    value={formData.administrativeJurisdictionType}
                    onChange={handleChange}
                  >
                    <option value="">اختر نوع المحكمة</option>
                    <option value="appeal_court">محكمة الاستئناف الإدارية</option>
                    <option value="state_council">مجلس الدولة</option>
                  </select>
                </div>

                {formData.administrativeJurisdictionType === "appeal_court" && (
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">محكمة الاستئناف الإدارية</label>
                      <select
                        name="administrativeAppealCourtId"
                        className="form-select"
                        value={formData.administrativeAppealCourtId}
                        onChange={handleChange}
                      >
                        <option value="">اختر محكمة الاستئناف الإدارية</option>
                        {administrativeAppealCourts.map((court) => (
                          <option key={court.id} value={court.id}>
                            {court.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {formData.administrativeAppealCourtId && (
                      <div className="form-group">
                        <label className="form-label">المحكمة الإدارية</label>
                        <select
                          name="courtId"
                          className="form-select"
                          value={formData.courtId}
                          onChange={handleChange}
                        >
                          <option value="">اختر المحكمة الإدارية</option>
                          {courts.map((court, index) => (
                            <option
                              key={`admin-court-${court.id || index}`}
                              value={court.id}
                            >
                              {court.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {formData.administrativeJurisdictionType === "state_council" && (
                  <div className="form-group">
                    <label className="form-label">غرفة مجلس الدولة</label>
                    <select
                      name="stateCouncilChamberId"
                      className="form-select"
                      value={formData.stateCouncilChamberId}
                      onChange={handleChange}
                    >
                      <option value="">اختر الغرفة</option>
                      {stateCouncilChambers.map((chamber) => (
                        <option key={chamber.id} value={chamber.id}>
                          {chamber.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {formData.jurisdictionType === "commercial" && (
              <div className="form-group">
                <label className="form-label">المحكمة التجارية</label>
                <select
                  name="courtId"
                  className="form-select"
                  value={formData.courtId}
                  onChange={handleChange}
                >
                  <option value="">اختر المحكمة التجارية</option>
                  {commercialCourts.map((court, index) => (
                    <option
                      key={`commercial-court-${court.id || index}`}
                      value={court.id}
                    >
                      {court.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">الخصم</label>
                <input
                  type="text"
                  name="opposingParty"
                  className="form-control"
                  value={formData.opposingParty}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">محامي الخصم</label>
                <input
                  type="text"
                  name="opposingLawyer"
                  className="form-control"
                  value={formData.opposingLawyer}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">الحالة</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="first_instance">
                    على مستوى الدرجة الأولى
                  </option>
                  <option value="in_settlement">في إطار التسوية</option>
                  <option value="closed">مغلقة</option>
                  <option value="in_appeal">في الاستئناف</option>
                  <option value="extraordinary_appeal">طعن غير عادي</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">الأولوية</label>
                <select
                  name="priority"
                  className="form-select"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="normal">عادي</option>
                  <option value="urgent">قضاء استعجالي</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">تاريخ التكليف</label>
                <input
                  type="date"
                  name="startDate"
                  className="form-control"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              {user?.role === "admin" && (
                <div className="form-group">
                  <label className="form-label required">الأتعاب المتفق عليها (دج)</label>
                  <input
                    type="number"
                    name="amount"
                    className="form-control"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    required
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">ملاحظات</label>
              <textarea
                name="notes"
                className="form-textarea"
                value={formData.notes || ""}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              {caseData ? "حفظ التعديلات" : "إضافة قضية"}
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

function CasesPage() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [filters, setFilters] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCaseForPayment, setSelectedCaseForPayment] = useState(null);
  const confirm = useConfirm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [casesResult, clientsResult] = await Promise.all([
      caseAPI.getAll(),
      clientAPI.getAll(),
    ]);

    if (casesResult.success) setCases(casesResult.data);
    if (clientsResult.success) setClients(clientsResult.data);
    setLoading(false);
  };

  const handleSave = async (formData) => {
    try {
      let result;
      if (selectedCase) {
        result = await caseAPI.update(selectedCase.id, formData);
      } else {
        result = await caseAPI.create(formData);
      }

      if (result.success) {
        setShowModal(false);
        setSelectedCase(null);
        loadData();
        showSuccess(
          selectedCase
            ? "تم تحديث بيانات القضية بنجاح"
            : "تم إضافة القضية بنجاح"
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
      message: "هل أنت متأكد من حذف هذه القضية؟",
      confirmText: "نعم، احذف",
      cancelText: "إلغاء",
    });

    if (confirmed) {
      const result = await caseAPI.delete(id);
      if (result.success) {
        loadData();
        showSuccess("تم حذف القضية بنجاح");
      } else {
        showError("خطأ: " + result.error);
      }
    }
  };

  const handleEdit = (caseData) => {
    setSelectedCase(caseData);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedCase(null);
    setShowModal(true);
  };

  const handleAddPayment = (caseData) => {
    setSelectedCaseForPayment(caseData);
    setShowPaymentModal(true);
  };

  const handleSavePayment = async (paymentData) => {
    try {
      const result = await paymentAPI.create(paymentData);
      if (result.success) {
        setShowPaymentModal(false);
        setSelectedCaseForPayment(null);
        showSuccess("تم إضافة الدفعة بنجاح");
      } else {
        showError("خطأ: " + result.error);
      }
    } catch (error) {
      showError("حدث خطأ أثناء إضافة الدفعة");
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return "-";
    return client.type === "company"
      ? client.companyName
      : `${client.firstName} ${client.lastName}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ar-DZ");
  };

  const formatCurrency = (amount) => {
    if (!amount) return "-";
    return (
      new Intl.NumberFormat("ar-DZ", {
        style: "decimal",
        minimumFractionDigits: 2,
      }).format(amount) + " دج"
    );
  };

  const filteredCases = useMemo(() => {
    let filtered = [...cases];

    // Text search
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.caseNumber?.toLowerCase().includes(searchLower) ||
          c.title?.toLowerCase().includes(searchLower) ||
          c.opposingParty?.toLowerCase().includes(searchLower) ||
          getClientName(c.clientId).toLowerCase().includes(searchLower)
      );
    }

    // Date range filter
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter((c) => {
        if (!c.startDate) return false;
        return new Date(c.startDate) >= startDate;
      });
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((c) => {
        if (!c.startDate) return false;
        return new Date(c.startDate) <= endDate;
      });
    }

    // Case type filter
    if (filters.caseType && filters.caseType !== "all") {
      filtered = filtered.filter((c) => c.caseType === filters.caseType);
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((c) => c.status === filters.status);
    }

    // Priority filter
    if (filters.priority && filters.priority !== "all") {
      filtered = filtered.filter((c) => c.priority === filters.priority);
    }

    return filtered;
  }, [cases, filters, clients]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "caseNumber",
        header: "رقم القضية",
        cell: ({ row }) => <strong>{row.original.caseNumber}</strong>,
        enableSorting: true,
      },
      {
        accessorKey: "title",
        header: "العنوان",
        enableSorting: true,
      },
      {
        accessorKey: "clientId",
        header: "الموكل",
        cell: ({ row }) => getClientName(row.original.clientId),
        enableSorting: false,
      },
      {
        accessorKey: "caseType",
        header: "النوع",
        cell: ({ row }) => (
          <span className="badge badge-secondary">
            {getCaseTypeLabel(row.original.caseType)}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => (
          <span
            className={`badge ${
              row.original.status === "first_instance"
                ? "badge-info"
                : row.original.status === "in_settlement"
                  ? "badge-warning"
                  : row.original.status === "closed"
                    ? "badge-success"
                    : row.original.status === "in_appeal"
                      ? "badge-warning"
                      : row.original.status === "extraordinary_appeal"
                        ? "badge-danger"
                        : "badge-secondary"
            }`}
          >
            {getStatusLabel(row.original.status)}
          </span>
        ),
        enableSorting: true,
      },
      {
        id: "actions",
        header: "الإجراءات",
        cell: ({ row }) => (
          <div className="action-buttons">
            <button
              className="btn btn-sm btn-info"
              onClick={() => navigate(`/cases/${row.original.id}`)}
              title="عرض التفاصيل"
            >
              👁️ عرض
            </button>
            {hasPermission("add_payment") && (
              <button
                className="btn btn-sm btn-success"
                onClick={() => handleAddPayment(row.original)}
                title="إضافة دفعة"
              >
                💰 دفعة
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
    [clients]
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
        <h1 className="page-title">إدارة القضايا</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          ➕ إضافة قضية جديدة
        </button>
      </div>

      <div className="card">
        <AdvancedFilter
          onFilterChange={setFilters}
          filterConfig={{
            searchPlaceholder: "🔍 البحث عن قضية (رقم، عنوان، خصم، موكل)...",
            showDateRange: true,
            showAmountRange: false,
            defaultValues: {
              caseType: "all",
              status: "all",
              priority: "all",
            },
            customFilters: [
              {
                name: "caseType",
                label: "نوع القضية",
                icon: "📋",
                type: "select",
                options: [
                  { value: "all", label: "جميع الأنواع" },
                  { value: "civil", label: "المدني" },
                  { value: "social", label: "الإجتماعي" },
                  { value: "real_estate", label: "العقاري" },
                  { value: "family", label: "شؤون الأسرة" },
                  { value: "commercial", label: "التجاري" },
                  { value: "maritime", label: "البحري" },
                  { value: "urgent", label: "الاستعجالي" },
                  { value: "misdemeanor", label: "الجنح" },
                  { value: "violations", label: "المخالفات" },
                  { value: "juveniles", label: "الأحداث" },
                  { value: "penalty_enforcement", label: "تطبيق العقوبات" },
                  { value: "other", label: "أخرى" },
                ],
              },
              {
                name: "status",
                label: "حالة القضية",
                icon: "📊",
                type: "select",
                options: [
                  { value: "all", label: "جميع الحالات" },
                  { value: "first_instance", label: "على مستوى الدرجة الأولى" },
                  { value: "in_settlement", label: "في إطار التسوية" },
                  { value: "closed", label: "مغلقة" },
                  { value: "in_appeal", label: "في الاستئناف" },
                  { value: "extraordinary_appeal", label: "طعن غير عادي" },
                ],
              },
              {
                name: "priority",
                label: "الأولوية",
                icon: "⚠️",
                type: "select",
                options: [
                  { value: "all", label: "جميع الأولويات" },
                  { value: "normal", label: "عادي" },
                  { value: "urgent", label: "قضاء استعجالي" },
                ],
              },
            ],
          }}
        />

        <DataTable
          data={filteredCases}
          columns={columns}
          pageSize={10}
          showPagination={true}
          emptyMessage={
            Object.keys(filters).length > 0
              ? "لم يتم العثور على قضايا مطابقة للبحث"
              : "لم يتم إضافة أي قضايا بعد"
          }
        />
      </div>

      {showModal && (
        <CaseModal
          caseData={selectedCase}
          onClose={() => {
            setShowModal(false);
            setSelectedCase(null);
          }}
          onSave={handleSave}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          caseId={selectedCaseForPayment?.id}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedCaseForPayment(null);
          }}
          onSave={handleSavePayment}
        />
      )}
    </div>
  );
}

export default CasesPage;
