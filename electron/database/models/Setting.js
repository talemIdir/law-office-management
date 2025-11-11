import { DataTypes } from "sequelize";
import { sequelize } from "../config.js";

// Settings Model - نموذج الإعدادات
const Setting = sequelize.define(
  "Setting",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      comment: "المفتاح",
    },
    value: {
      type: DataTypes.TEXT,
      comment: "القيمة",
    },
    category: {
      type: DataTypes.STRING,
      comment: "الفئة",
    },
    description: {
      type: DataTypes.TEXT,
      comment: "الوصف",
    },
  },
  {
    timestamps: true,
    tableName: "settings",
  },
);

export default Setting;
