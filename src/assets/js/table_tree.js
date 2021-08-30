/**
 * 将树形接口转换成table可以绑定的数组结构
 */
import Vue from 'vue'

function DataTransfer(data) {
    if (!(this instanceof DataTransfer)) {
        return new DataTransfer(data, null, null);
    }
}

DataTransfer.treeToArray = function(data, parent, level, expandAll) {
    let tmp = [];
    Array.from(data).forEach(function(record) {
        if (record._expanded === undefined) {
            Vue.set(record, '_expanded', expandAll);
        }

        if (parent) {
            Vue.set(record, "_parent", parent);
        }
        
        let _level = 0;
        if (level !== undefined && level !== null) {
            _level = level + 1;
        }
        Vue.set(record, '_level', _level);
        
        record.isEdit= record.isEdit? true:false;
        if (record.isEdit) {
        	Vue.set(record, '_isEdit', true);
        	Vue.set(record, 'isEdit', false);
        }
        
        tmp.push(record);
        if (record.children && record.children.length > 0) {
            let children = DataTransfer.treeToArray(record.children, record, _level, expandAll);
            tmp = tmp.concat(children);
        }
    });
    return tmp;
}

export default DataTransfer;