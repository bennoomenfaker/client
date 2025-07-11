import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import userReducer from './slices/userSlice';
import hospitalReducer from './slices/hospitalSlice';
import hospitalServiceReducer from './slices/hospitalServiceSlice';
import gouvernoratReducer from './slices/gouvernoratSlice';
import emdnNomenclatureReducer from './slices/emdnNomenclatureSlice';
import brandReducer from './slices/brandsSlice';
import equipmentReducer from './slices/equipmentSlice';
import maintenancePlanReducer  from './slices/maintenancePlanSlice ';
import slaReducer from './slices/slaSlice';
import sparePartsReducer from './slices/sparePartSlice'
import notificationReducer from "./slices/notificationSlice";
import incidentReducer from "./slices/incidentSlice";
import correctiveMaintenanceReducer from "./slices/correctiveMaintenanceSlice";
import transferReducer from "./slices/transferSlice";
import alertReducer from "./slices/alertSlice"
import supplierSlice from "./slices/supplierSlice"
const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userReducer,
    hospital: hospitalReducer, 
    hospitalService: hospitalServiceReducer, 
    emdnNomenclature: emdnNomenclatureReducer,
    gouvernorat: gouvernoratReducer,
    brand: brandReducer,
    equipment: equipmentReducer,
    maintenancePlan: maintenancePlanReducer,
    sla: slaReducer,
    spareParts: sparePartsReducer,
    notifications: notificationReducer,
    incident: incidentReducer,
    correctiveMaintenance: correctiveMaintenanceReducer,
    transfer: transferReducer,
    alert : alertReducer,
    supplier: supplierSlice,

    },
});

export default store;
