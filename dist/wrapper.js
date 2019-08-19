"use strict";

module.exports = function (src) {
  return "\n'use strict';\nconst {msg, block, balanceOf, loadContract, loadLibrary, isValidAddress, deployContract} = this.runtime\n\nif (!msg.name) {\n  throw new Error(\"Method name is required.\")\n}\n\n".concat(src, "\n\n// block to scope our let/const\n{\n  const __name = typeof __metadata[msg.name] === 'string' ? __metadata[msg.name] : msg.name\n  if ([\"__on_deployed\", \"__on_received\"].includes(msg.name) && !(__name in __contract)) {\n    // call event methods but contract does not have one\n    return;\n  }\n  if (![\"__metadata\", \"address\", \"balance\", \"deployedBy\"].includes(__name) && \n    (!(__name in __contract) || __name.startsWith('#'))) {\n      throw new Error(\"Method \" + __name + \" is private or does not exist.\");\n  }\n  if (__metadata[__name] && __metadata[__name].decorators && __metadata[__name].decorators.includes('internal')) {\n    throw new Error(\"Method \" + msg.name + \" is internal.\")\n  }\n  Object.defineProperties(__contract, Object.getOwnPropertyDescriptors(this));\n  const __c = {\n    instance: __contract,\n    meta: __metadata\n  };\n  if (__name === \"__metadata\") {\n    return __c;\n  }\n  const __checkType = (value, typeHolder, typeProp, info) => {\n    if (!typeHolder) return value\n    const types = typeHolder[typeProp]\n    if (types && Array.isArray(types)) {\n      let valueType = value === null ? 'null' : typeof value;\n      if (!types.includes(valueType)) {\n        if (valueType === 'object') {\n          valueType = Object.prototype.toString.call(value).split(' ')[1].slice(0, -1).toLowerCase()\n          if (types.includes(valueType)) return value;\n        }\n\n        if(valueType === 'string' && types.includes('address')) {\n          if(isValidAddress(value)) {\n            return true;\n          }\n        }\n\n        throw new Error(\"Error executing '\" + __name + \"': wrong \" + info + \" type. Expect: \" + \n        types.join(\" | \") + \". Got: \" + valueType + \".\");\n      }\n    }\n    return value;\n  }\n  if (typeof __c.instance[__name] === \"function\") {\n    // Check stateMutablitity\n    const isValidCallType = (d) => {\n      if ([\"__on_deployed\", \"__on_received\"].includes(__name) || !__metadata[__name]) return true; // FIXME\n      if (!__metadata[__name].decorators) {\n        return false;\n      }\n      if (d === \"transaction\" && __metadata[__name].decorators.includes(\"payable\")) {\n        return true;\n      } \n      return __metadata[__name].decorators.includes(d);\n    }\n    if (!isValidCallType(msg.callType)) {\n      throw new Error(\"Method \" + __name + \" is not decorated as @\" + msg.callType + \" and cannot be invoked in such mode\");\n    }\n      // Check input param type\n    const params = msg.params;\n    if (__metadata[__name] && __metadata[__name].params && __metadata[__name].params.length) {\n      __metadata[__name].params.forEach((p, index) => {\n        const pv = (params.length  > index) ? params[index] : undefined;\n        __checkType(pv, p, 'type', \"param '\" + p.name + \"'\");\n      })\n    }\n    // Call the function, finally\n    const result = __c.instance[__name].apply(__c.instance, params);\n    return __checkType(result, __metadata[__name], 'returnType', \"return\");\n  }\n  return __checkType(__c.instance[__name], __metadata[__name], 'fieldType', 'field');\n}\n");
};