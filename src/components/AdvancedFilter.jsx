import React, { useState } from "react";
import "../styles/AdvancedFilter.css";

/**
 * Advanced Filter Component
 * Supports text search, date ranges, amount ranges, and multiple filter criteria
 */
function AdvancedFilter({ onFilterChange, filterConfig }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    ...filterConfig.defaultValues,
  });

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      searchTerm: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      ...filterConfig.defaultValues,
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.searchTerm ||
      filters.startDate ||
      filters.endDate ||
      filters.minAmount ||
      filters.maxAmount ||
      Object.keys(filterConfig.defaultValues || {}).some(
        (key) => filters[key] !== filterConfig.defaultValues[key]
      )
    );
  };

  return (
    <div className="advanced-filter">
      {/* Search Bar */}
      <div className="filter-row">
        <input
          type="text"
          className="search-input"
          placeholder={filterConfig.searchPlaceholder || "🔍 البحث..."}
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
        />
        <button
          className={`btn btn-filter ${isExpanded ? "active" : ""}`}
          onClick={() => setIsExpanded(!isExpanded)}
          title="بحث متقدم"
        >
          🔍 بحث متقدم {hasActiveFilters() && <span className="filter-badge">•</span>}
        </button>
        {hasActiveFilters() && (
          <button
            className="btn btn-outline"
            onClick={handleReset}
            title="إعادة تعيين الفلاتر"
          >
            ✖️ إعادة تعيين
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {isExpanded && (
        <div className="filter-panel">
          <div className="filter-grid">
            {/* Date Range */}
            {filterConfig.showDateRange && (
              <div className="filter-section">
                <h4 className="filter-section-title">📅 الفترة الزمنية</h4>
                <div className="filter-group">
                  <label className="filter-label">من تاريخ</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">إلى تاريخ</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Amount Range */}
            {filterConfig.showAmountRange && (
              <div className="filter-section">
                <h4 className="filter-section-title">💰 نطاق المبلغ</h4>
                <div className="filter-group">
                  <label className="filter-label">الحد الأدنى (دج)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0.00"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                    step="0.01"
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">الحد الأقصى (دج)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0.00"
                    value={filters.maxAmount}
                    onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                    step="0.01"
                  />
                </div>
              </div>
            )}

            {/* Custom Filters */}
            {filterConfig.customFilters &&
              filterConfig.customFilters.map((customFilter) => (
                <div key={customFilter.name} className="filter-section">
                  <h4 className="filter-section-title">
                    {customFilter.icon} {customFilter.label}
                  </h4>
                  {customFilter.type === "select" && (
                    <div className="filter-group">
                      <select
                        className="form-select"
                        value={filters[customFilter.name] || ""}
                        onChange={(e) =>
                          handleFilterChange(customFilter.name, e.target.value)
                        }
                      >
                        {customFilter.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {customFilter.type === "multi-select" && (
                    <div className="filter-group">
                      {customFilter.options.map((option) => (
                        <label key={option.value} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={(filters[customFilter.name] || []).includes(
                              option.value
                            )}
                            onChange={(e) => {
                              const currentValues = filters[customFilter.name] || [];
                              const newValues = e.target.checked
                                ? [...currentValues, option.value]
                                : currentValues.filter((v) => v !== option.value);
                              handleFilterChange(customFilter.name, newValues);
                            }}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvancedFilter;
