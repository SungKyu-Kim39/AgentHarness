"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/zod/v3/helpers/util.js
var util, objectUtil, ZodParsedType, getParsedType;
var init_util = __esm({
  "node_modules/zod/v3/helpers/util.js"() {
    (function(util2) {
      util2.assertEqual = (_) => {
      };
      function assertIs(_arg) {
      }
      util2.assertIs = assertIs;
      function assertNever(_x) {
        throw new Error();
      }
      util2.assertNever = assertNever;
      util2.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
          obj[item] = item;
        }
        return obj;
      };
      util2.getValidEnumValues = (obj) => {
        const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
          filtered[k] = obj[k];
        }
        return util2.objectValues(filtered);
      };
      util2.objectValues = (obj) => {
        return util2.objectKeys(obj).map(function(e) {
          return obj[e];
        });
      };
      util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object2) => {
        const keys = [];
        for (const key in object2) {
          if (Object.prototype.hasOwnProperty.call(object2, key)) {
            keys.push(key);
          }
        }
        return keys;
      };
      util2.find = (arr, checker) => {
        for (const item of arr) {
          if (checker(item))
            return item;
        }
        return void 0;
      };
      util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
      function joinValues(array, separator = " | ") {
        return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
      }
      util2.joinValues = joinValues;
      util2.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      };
    })(util || (util = {}));
    (function(objectUtil2) {
      objectUtil2.mergeShapes = (first, second) => {
        return {
          ...first,
          ...second
          // second overwrites first
        };
      };
    })(objectUtil || (objectUtil = {}));
    ZodParsedType = util.arrayToEnum([
      "string",
      "nan",
      "number",
      "integer",
      "float",
      "boolean",
      "date",
      "bigint",
      "symbol",
      "function",
      "undefined",
      "null",
      "array",
      "object",
      "unknown",
      "promise",
      "void",
      "never",
      "map",
      "set"
    ]);
    getParsedType = (data) => {
      const t = typeof data;
      switch (t) {
        case "undefined":
          return ZodParsedType.undefined;
        case "string":
          return ZodParsedType.string;
        case "number":
          return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
        case "boolean":
          return ZodParsedType.boolean;
        case "function":
          return ZodParsedType.function;
        case "bigint":
          return ZodParsedType.bigint;
        case "symbol":
          return ZodParsedType.symbol;
        case "object":
          if (Array.isArray(data)) {
            return ZodParsedType.array;
          }
          if (data === null) {
            return ZodParsedType.null;
          }
          if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
            return ZodParsedType.promise;
          }
          if (typeof Map !== "undefined" && data instanceof Map) {
            return ZodParsedType.map;
          }
          if (typeof Set !== "undefined" && data instanceof Set) {
            return ZodParsedType.set;
          }
          if (typeof Date !== "undefined" && data instanceof Date) {
            return ZodParsedType.date;
          }
          return ZodParsedType.object;
        default:
          return ZodParsedType.unknown;
      }
    };
  }
});

// node_modules/zod/v3/ZodError.js
var ZodIssueCode, quotelessJson, ZodError;
var init_ZodError = __esm({
  "node_modules/zod/v3/ZodError.js"() {
    init_util();
    ZodIssueCode = util.arrayToEnum([
      "invalid_type",
      "invalid_literal",
      "custom",
      "invalid_union",
      "invalid_union_discriminator",
      "invalid_enum_value",
      "unrecognized_keys",
      "invalid_arguments",
      "invalid_return_type",
      "invalid_date",
      "invalid_string",
      "too_small",
      "too_big",
      "invalid_intersection_types",
      "not_multiple_of",
      "not_finite"
    ]);
    quotelessJson = (obj) => {
      const json = JSON.stringify(obj, null, 2);
      return json.replace(/"([^"]+)":/g, "$1:");
    };
    ZodError = class _ZodError extends Error {
      get errors() {
        return this.issues;
      }
      constructor(issues) {
        super();
        this.issues = [];
        this.addIssue = (sub) => {
          this.issues = [...this.issues, sub];
        };
        this.addIssues = (subs = []) => {
          this.issues = [...this.issues, ...subs];
        };
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(this, actualProto);
        } else {
          this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
      }
      format(_mapper) {
        const mapper = _mapper || function(issue) {
          return issue.message;
        };
        const fieldErrors = { _errors: [] };
        const processError = (error) => {
          for (const issue of error.issues) {
            if (issue.code === "invalid_union") {
              issue.unionErrors.map(processError);
            } else if (issue.code === "invalid_return_type") {
              processError(issue.returnTypeError);
            } else if (issue.code === "invalid_arguments") {
              processError(issue.argumentsError);
            } else if (issue.path.length === 0) {
              fieldErrors._errors.push(mapper(issue));
            } else {
              let curr = fieldErrors;
              let i = 0;
              while (i < issue.path.length) {
                const el = issue.path[i];
                const terminal = i === issue.path.length - 1;
                if (!terminal) {
                  curr[el] = curr[el] || { _errors: [] };
                } else {
                  curr[el] = curr[el] || { _errors: [] };
                  curr[el]._errors.push(mapper(issue));
                }
                curr = curr[el];
                i++;
              }
            }
          }
        };
        processError(this);
        return fieldErrors;
      }
      static assert(value) {
        if (!(value instanceof _ZodError)) {
          throw new Error(`Not a ZodError: ${value}`);
        }
      }
      toString() {
        return this.message;
      }
      get message() {
        return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
      }
      get isEmpty() {
        return this.issues.length === 0;
      }
      flatten(mapper = (issue) => issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of this.issues) {
          if (sub.path.length > 0) {
            const firstEl = sub.path[0];
            fieldErrors[firstEl] = fieldErrors[firstEl] || [];
            fieldErrors[firstEl].push(mapper(sub));
          } else {
            formErrors.push(mapper(sub));
          }
        }
        return { formErrors, fieldErrors };
      }
      get formErrors() {
        return this.flatten();
      }
    };
    ZodError.create = (issues) => {
      const error = new ZodError(issues);
      return error;
    };
  }
});

// node_modules/zod/v3/locales/en.js
var errorMap, en_default;
var init_en = __esm({
  "node_modules/zod/v3/locales/en.js"() {
    init_ZodError();
    init_util();
    errorMap = (issue, _ctx) => {
      let message;
      switch (issue.code) {
        case ZodIssueCode.invalid_type:
          if (issue.received === ZodParsedType.undefined) {
            message = "Required";
          } else {
            message = `Expected ${issue.expected}, received ${issue.received}`;
          }
          break;
        case ZodIssueCode.invalid_literal:
          message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
          break;
        case ZodIssueCode.unrecognized_keys:
          message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
          break;
        case ZodIssueCode.invalid_union:
          message = `Invalid input`;
          break;
        case ZodIssueCode.invalid_union_discriminator:
          message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
          break;
        case ZodIssueCode.invalid_enum_value:
          message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
          break;
        case ZodIssueCode.invalid_arguments:
          message = `Invalid function arguments`;
          break;
        case ZodIssueCode.invalid_return_type:
          message = `Invalid function return type`;
          break;
        case ZodIssueCode.invalid_date:
          message = `Invalid date`;
          break;
        case ZodIssueCode.invalid_string:
          if (typeof issue.validation === "object") {
            if ("includes" in issue.validation) {
              message = `Invalid input: must include "${issue.validation.includes}"`;
              if (typeof issue.validation.position === "number") {
                message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
              }
            } else if ("startsWith" in issue.validation) {
              message = `Invalid input: must start with "${issue.validation.startsWith}"`;
            } else if ("endsWith" in issue.validation) {
              message = `Invalid input: must end with "${issue.validation.endsWith}"`;
            } else {
              util.assertNever(issue.validation);
            }
          } else if (issue.validation !== "regex") {
            message = `Invalid ${issue.validation}`;
          } else {
            message = "Invalid";
          }
          break;
        case ZodIssueCode.too_small:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "bigint")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
          else
            message = "Invalid input";
          break;
        case ZodIssueCode.too_big:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "bigint")
            message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
          else
            message = "Invalid input";
          break;
        case ZodIssueCode.custom:
          message = `Invalid input`;
          break;
        case ZodIssueCode.invalid_intersection_types:
          message = `Intersection results could not be merged`;
          break;
        case ZodIssueCode.not_multiple_of:
          message = `Number must be a multiple of ${issue.multipleOf}`;
          break;
        case ZodIssueCode.not_finite:
          message = "Number must be finite";
          break;
        default:
          message = _ctx.defaultError;
          util.assertNever(issue);
      }
      return { message };
    };
    en_default = errorMap;
  }
});

// node_modules/zod/v3/errors.js
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}
var overrideErrorMap;
var init_errors = __esm({
  "node_modules/zod/v3/errors.js"() {
    init_en();
    overrideErrorMap = en_default;
  }
});

// node_modules/zod/v3/helpers/parseUtil.js
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var makeIssue, EMPTY_PATH, ParseStatus, INVALID, DIRTY, OK, isAborted, isDirty, isValid, isAsync;
var init_parseUtil = __esm({
  "node_modules/zod/v3/helpers/parseUtil.js"() {
    init_errors();
    init_en();
    makeIssue = (params) => {
      const { data, path: path20, errorMaps, issueData } = params;
      const fullPath = [...path20, ...issueData.path || []];
      const fullIssue = {
        ...issueData,
        path: fullPath
      };
      if (issueData.message !== void 0) {
        return {
          ...issueData,
          path: fullPath,
          message: issueData.message
        };
      }
      let errorMessage = "";
      const maps = errorMaps.filter((m) => !!m).slice().reverse();
      for (const map of maps) {
        errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
      }
      return {
        ...issueData,
        path: fullPath,
        message: errorMessage
      };
    };
    EMPTY_PATH = [];
    ParseStatus = class _ParseStatus {
      constructor() {
        this.value = "valid";
      }
      dirty() {
        if (this.value === "valid")
          this.value = "dirty";
      }
      abort() {
        if (this.value !== "aborted")
          this.value = "aborted";
      }
      static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results) {
          if (s.status === "aborted")
            return INVALID;
          if (s.status === "dirty")
            status.dirty();
          arrayValue.push(s.value);
        }
        return { status: status.value, value: arrayValue };
      }
      static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value
          });
        }
        return _ParseStatus.mergeObjectSync(status, syncPairs);
      }
      static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair of pairs) {
          const { key, value } = pair;
          if (key.status === "aborted")
            return INVALID;
          if (value.status === "aborted")
            return INVALID;
          if (key.status === "dirty")
            status.dirty();
          if (value.status === "dirty")
            status.dirty();
          if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
            finalObject[key.value] = value.value;
          }
        }
        return { status: status.value, value: finalObject };
      }
    };
    INVALID = Object.freeze({
      status: "aborted"
    });
    DIRTY = (value) => ({ status: "dirty", value });
    OK = (value) => ({ status: "valid", value });
    isAborted = (x) => x.status === "aborted";
    isDirty = (x) => x.status === "dirty";
    isValid = (x) => x.status === "valid";
    isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
  }
});

// node_modules/zod/v3/helpers/typeAliases.js
var init_typeAliases = __esm({
  "node_modules/zod/v3/helpers/typeAliases.js"() {
  }
});

// node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
var init_errorUtil = __esm({
  "node_modules/zod/v3/helpers/errorUtil.js"() {
    (function(errorUtil2) {
      errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
      errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
    })(errorUtil || (errorUtil = {}));
  }
});

// node_modules/zod/v3/types.js
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
function deepPartialify(schema2) {
  if (schema2 instanceof ZodObject) {
    const newShape = {};
    for (const key in schema2.shape) {
      const fieldSchema = schema2.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema2._def,
      shape: () => newShape
    });
  } else if (schema2 instanceof ZodArray) {
    return new ZodArray({
      ...schema2._def,
      type: deepPartialify(schema2.element)
    });
  } else if (schema2 instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema2.unwrap()));
  } else if (schema2 instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema2.unwrap()));
  } else if (schema2 instanceof ZodTuple) {
    return ZodTuple.create(schema2.items.map((item) => deepPartialify(item)));
  } else {
    return schema2;
  }
}
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var ParseInputLazyPath, handleResult, ZodType, cuidRegex, cuid2Regex, ulidRegex, uuidRegex, nanoidRegex, jwtRegex, durationRegex, emailRegex, _emojiRegex, emojiRegex, ipv4Regex, ipv4CidrRegex, ipv6Regex, ipv6CidrRegex, base64Regex, base64urlRegex, dateRegexSource, dateRegex, ZodString, ZodNumber, ZodBigInt, ZodBoolean, ZodDate, ZodSymbol, ZodUndefined, ZodNull, ZodAny, ZodUnknown, ZodNever, ZodVoid, ZodArray, ZodObject, ZodUnion, getDiscriminator, ZodDiscriminatedUnion, ZodIntersection, ZodTuple, ZodRecord, ZodMap, ZodSet, ZodFunction, ZodLazy, ZodLiteral, ZodEnum, ZodNativeEnum, ZodPromise, ZodEffects, ZodOptional, ZodNullable, ZodDefault, ZodCatch, ZodNaN, BRAND, ZodBranded, ZodPipeline, ZodReadonly, late, ZodFirstPartyTypeKind, instanceOfType, stringType, numberType, nanType, bigIntType, booleanType, dateType, symbolType, undefinedType, nullType, anyType, unknownType, neverType, voidType, arrayType, objectType, strictObjectType, unionType, discriminatedUnionType, intersectionType, tupleType, recordType, mapType, setType, functionType, lazyType, literalType, enumType, nativeEnumType, promiseType, effectsType, optionalType, nullableType, preprocessType, pipelineType, ostring, onumber, oboolean, coerce, NEVER;
var init_types = __esm({
  "node_modules/zod/v3/types.js"() {
    init_ZodError();
    init_errors();
    init_errorUtil();
    init_parseUtil();
    init_util();
    ParseInputLazyPath = class {
      constructor(parent, value, path20, key) {
        this._cachedPath = [];
        this.parent = parent;
        this.data = value;
        this._path = path20;
        this._key = key;
      }
      get path() {
        if (!this._cachedPath.length) {
          if (Array.isArray(this._key)) {
            this._cachedPath.push(...this._path, ...this._key);
          } else {
            this._cachedPath.push(...this._path, this._key);
          }
        }
        return this._cachedPath;
      }
    };
    handleResult = (ctx, result) => {
      if (isValid(result)) {
        return { success: true, data: result.value };
      } else {
        if (!ctx.common.issues.length) {
          throw new Error("Validation failed but no issues detected.");
        }
        return {
          success: false,
          get error() {
            if (this._error)
              return this._error;
            const error = new ZodError(ctx.common.issues);
            this._error = error;
            return this._error;
          }
        };
      }
    };
    ZodType = class {
      get description() {
        return this._def.description;
      }
      _getType(input) {
        return getParsedType(input.data);
      }
      _getOrReturnCtx(input, ctx) {
        return ctx || {
          common: input.parent.common,
          data: input.data,
          parsedType: getParsedType(input.data),
          schemaErrorMap: this._def.errorMap,
          path: input.path,
          parent: input.parent
        };
      }
      _processInputParams(input) {
        return {
          status: new ParseStatus(),
          ctx: {
            common: input.parent.common,
            data: input.data,
            parsedType: getParsedType(input.data),
            schemaErrorMap: this._def.errorMap,
            path: input.path,
            parent: input.parent
          }
        };
      }
      _parseSync(input) {
        const result = this._parse(input);
        if (isAsync(result)) {
          throw new Error("Synchronous parse encountered promise.");
        }
        return result;
      }
      _parseAsync(input) {
        const result = this._parse(input);
        return Promise.resolve(result);
      }
      parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      safeParse(data, params) {
        const ctx = {
          common: {
            issues: [],
            async: params?.async ?? false,
            contextualErrorMap: params?.errorMap
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        const result = this._parseSync({ data, path: ctx.path, parent: ctx });
        return handleResult(ctx, result);
      }
      "~validate"(data) {
        const ctx = {
          common: {
            issues: [],
            async: !!this["~standard"].async
          },
          path: [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        if (!this["~standard"].async) {
          try {
            const result = this._parseSync({ data, path: [], parent: ctx });
            return isValid(result) ? {
              value: result.value
            } : {
              issues: ctx.common.issues
            };
          } catch (err) {
            if (err?.message?.toLowerCase()?.includes("encountered")) {
              this["~standard"].async = true;
            }
            ctx.common = {
              issues: [],
              async: true
            };
          }
        }
        return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        });
      }
      async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      async safeParseAsync(data, params) {
        const ctx = {
          common: {
            issues: [],
            contextualErrorMap: params?.errorMap,
            async: true
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
        const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
      }
      refine(check, message) {
        const getIssueProperties = (val) => {
          if (typeof message === "string" || typeof message === "undefined") {
            return { message };
          } else if (typeof message === "function") {
            return message(val);
          } else {
            return message;
          }
        };
        return this._refinement((val, ctx) => {
          const result = check(val);
          const setError = () => ctx.addIssue({
            code: ZodIssueCode.custom,
            ...getIssueProperties(val)
          });
          if (typeof Promise !== "undefined" && result instanceof Promise) {
            return result.then((data) => {
              if (!data) {
                setError();
                return false;
              } else {
                return true;
              }
            });
          }
          if (!result) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      refinement(check, refinementData) {
        return this._refinement((val, ctx) => {
          if (!check(val)) {
            ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
            return false;
          } else {
            return true;
          }
        });
      }
      _refinement(refinement) {
        return new ZodEffects({
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "refinement", refinement }
        });
      }
      superRefine(refinement) {
        return this._refinement(refinement);
      }
      constructor(def) {
        this.spa = this.safeParseAsync;
        this._def = def;
        this.parse = this.parse.bind(this);
        this.safeParse = this.safeParse.bind(this);
        this.parseAsync = this.parseAsync.bind(this);
        this.safeParseAsync = this.safeParseAsync.bind(this);
        this.spa = this.spa.bind(this);
        this.refine = this.refine.bind(this);
        this.refinement = this.refinement.bind(this);
        this.superRefine = this.superRefine.bind(this);
        this.optional = this.optional.bind(this);
        this.nullable = this.nullable.bind(this);
        this.nullish = this.nullish.bind(this);
        this.array = this.array.bind(this);
        this.promise = this.promise.bind(this);
        this.or = this.or.bind(this);
        this.and = this.and.bind(this);
        this.transform = this.transform.bind(this);
        this.brand = this.brand.bind(this);
        this.default = this.default.bind(this);
        this.catch = this.catch.bind(this);
        this.describe = this.describe.bind(this);
        this.pipe = this.pipe.bind(this);
        this.readonly = this.readonly.bind(this);
        this.isNullable = this.isNullable.bind(this);
        this.isOptional = this.isOptional.bind(this);
        this["~standard"] = {
          version: 1,
          vendor: "zod",
          validate: (data) => this["~validate"](data)
        };
      }
      optional() {
        return ZodOptional.create(this, this._def);
      }
      nullable() {
        return ZodNullable.create(this, this._def);
      }
      nullish() {
        return this.nullable().optional();
      }
      array() {
        return ZodArray.create(this);
      }
      promise() {
        return ZodPromise.create(this, this._def);
      }
      or(option) {
        return ZodUnion.create([this, option], this._def);
      }
      and(incoming) {
        return ZodIntersection.create(this, incoming, this._def);
      }
      transform(transform) {
        return new ZodEffects({
          ...processCreateParams(this._def),
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "transform", transform }
        });
      }
      default(def) {
        const defaultValueFunc = typeof def === "function" ? def : () => def;
        return new ZodDefault({
          ...processCreateParams(this._def),
          innerType: this,
          defaultValue: defaultValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodDefault
        });
      }
      brand() {
        return new ZodBranded({
          typeName: ZodFirstPartyTypeKind.ZodBranded,
          type: this,
          ...processCreateParams(this._def)
        });
      }
      catch(def) {
        const catchValueFunc = typeof def === "function" ? def : () => def;
        return new ZodCatch({
          ...processCreateParams(this._def),
          innerType: this,
          catchValue: catchValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodCatch
        });
      }
      describe(description) {
        const This = this.constructor;
        return new This({
          ...this._def,
          description
        });
      }
      pipe(target) {
        return ZodPipeline.create(this, target);
      }
      readonly() {
        return ZodReadonly.create(this);
      }
      isOptional() {
        return this.safeParse(void 0).success;
      }
      isNullable() {
        return this.safeParse(null).success;
      }
    };
    cuidRegex = /^c[^\s-]{8,}$/i;
    cuid2Regex = /^[0-9a-z]+$/;
    ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
    uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    nanoidRegex = /^[a-z0-9_-]{21}$/i;
    jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
    emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
    _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
    ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
    ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
    ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
    base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
    dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
    dateRegex = new RegExp(`^${dateRegexSource}$`);
    ZodString = class _ZodString extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = String(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.string) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.string,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        const status = new ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.length < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.length > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "length") {
            const tooBig = input.data.length > check.value;
            const tooSmall = input.data.length < check.value;
            if (tooBig || tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              if (tooBig) {
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_big,
                  maximum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              } else if (tooSmall) {
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_small,
                  minimum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              }
              status.dirty();
            }
          } else if (check.kind === "email") {
            if (!emailRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "email",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "emoji") {
            if (!emojiRegex) {
              emojiRegex = new RegExp(_emojiRegex, "u");
            }
            if (!emojiRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "emoji",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "uuid") {
            if (!uuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "uuid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "nanoid") {
            if (!nanoidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "nanoid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid") {
            if (!cuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cuid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid2") {
            if (!cuid2Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cuid2",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ulid") {
            if (!ulidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "ulid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "url") {
            try {
              new URL(input.data);
            } catch {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "url",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "regex") {
            check.regex.lastIndex = 0;
            const testResult = check.regex.test(input.data);
            if (!testResult) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "regex",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "trim") {
            input.data = input.data.trim();
          } else if (check.kind === "includes") {
            if (!input.data.includes(check.value, check.position)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { includes: check.value, position: check.position },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "toLowerCase") {
            input.data = input.data.toLowerCase();
          } else if (check.kind === "toUpperCase") {
            input.data = input.data.toUpperCase();
          } else if (check.kind === "startsWith") {
            if (!input.data.startsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { startsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "endsWith") {
            if (!input.data.endsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { endsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "datetime") {
            const regex = datetimeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "datetime",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "date") {
            const regex = dateRegex;
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "date",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "time") {
            const regex = timeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "time",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "duration") {
            if (!durationRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "duration",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ip") {
            if (!isValidIP(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "ip",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "jwt") {
            if (!isValidJWT(input.data, check.alg)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "jwt",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cidr") {
            if (!isValidCidr(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cidr",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64") {
            if (!base64Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "base64",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64url") {
            if (!base64urlRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "base64url",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _regex(regex, validation, message) {
        return this.refinement((data) => regex.test(data), {
          validation,
          code: ZodIssueCode.invalid_string,
          ...errorUtil.errToObj(message)
        });
      }
      _addCheck(check) {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      email(message) {
        return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
      }
      url(message) {
        return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
      }
      emoji(message) {
        return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
      }
      uuid(message) {
        return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
      }
      nanoid(message) {
        return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
      }
      cuid(message) {
        return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
      }
      cuid2(message) {
        return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
      }
      ulid(message) {
        return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
      }
      base64(message) {
        return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
      }
      base64url(message) {
        return this._addCheck({
          kind: "base64url",
          ...errorUtil.errToObj(message)
        });
      }
      jwt(options) {
        return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
      }
      ip(options) {
        return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
      }
      cidr(options) {
        return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
      }
      datetime(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "datetime",
            precision: null,
            offset: false,
            local: false,
            message: options
          });
        }
        return this._addCheck({
          kind: "datetime",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          offset: options?.offset ?? false,
          local: options?.local ?? false,
          ...errorUtil.errToObj(options?.message)
        });
      }
      date(message) {
        return this._addCheck({ kind: "date", message });
      }
      time(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "time",
            precision: null,
            message: options
          });
        }
        return this._addCheck({
          kind: "time",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          ...errorUtil.errToObj(options?.message)
        });
      }
      duration(message) {
        return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
      }
      regex(regex, message) {
        return this._addCheck({
          kind: "regex",
          regex,
          ...errorUtil.errToObj(message)
        });
      }
      includes(value, options) {
        return this._addCheck({
          kind: "includes",
          value,
          position: options?.position,
          ...errorUtil.errToObj(options?.message)
        });
      }
      startsWith(value, message) {
        return this._addCheck({
          kind: "startsWith",
          value,
          ...errorUtil.errToObj(message)
        });
      }
      endsWith(value, message) {
        return this._addCheck({
          kind: "endsWith",
          value,
          ...errorUtil.errToObj(message)
        });
      }
      min(minLength, message) {
        return this._addCheck({
          kind: "min",
          value: minLength,
          ...errorUtil.errToObj(message)
        });
      }
      max(maxLength, message) {
        return this._addCheck({
          kind: "max",
          value: maxLength,
          ...errorUtil.errToObj(message)
        });
      }
      length(len, message) {
        return this._addCheck({
          kind: "length",
          value: len,
          ...errorUtil.errToObj(message)
        });
      }
      /**
       * Equivalent to `.min(1)`
       */
      nonempty(message) {
        return this.min(1, errorUtil.errToObj(message));
      }
      trim() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "trim" }]
        });
      }
      toLowerCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toLowerCase" }]
        });
      }
      toUpperCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toUpperCase" }]
        });
      }
      get isDatetime() {
        return !!this._def.checks.find((ch) => ch.kind === "datetime");
      }
      get isDate() {
        return !!this._def.checks.find((ch) => ch.kind === "date");
      }
      get isTime() {
        return !!this._def.checks.find((ch) => ch.kind === "time");
      }
      get isDuration() {
        return !!this._def.checks.find((ch) => ch.kind === "duration");
      }
      get isEmail() {
        return !!this._def.checks.find((ch) => ch.kind === "email");
      }
      get isURL() {
        return !!this._def.checks.find((ch) => ch.kind === "url");
      }
      get isEmoji() {
        return !!this._def.checks.find((ch) => ch.kind === "emoji");
      }
      get isUUID() {
        return !!this._def.checks.find((ch) => ch.kind === "uuid");
      }
      get isNANOID() {
        return !!this._def.checks.find((ch) => ch.kind === "nanoid");
      }
      get isCUID() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid");
      }
      get isCUID2() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid2");
      }
      get isULID() {
        return !!this._def.checks.find((ch) => ch.kind === "ulid");
      }
      get isIP() {
        return !!this._def.checks.find((ch) => ch.kind === "ip");
      }
      get isCIDR() {
        return !!this._def.checks.find((ch) => ch.kind === "cidr");
      }
      get isBase64() {
        return !!this._def.checks.find((ch) => ch.kind === "base64");
      }
      get isBase64url() {
        return !!this._def.checks.find((ch) => ch.kind === "base64url");
      }
      get minLength() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxLength() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    ZodString.create = (params) => {
      return new ZodString({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodString,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    ZodNumber = class _ZodNumber extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
        this.step = this.multipleOf;
      }
      _parse(input) {
        if (this._def.coerce) {
          input.data = Number(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.number) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.number,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        let ctx = void 0;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "int") {
            if (!util.isInteger(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: "integer",
                received: "float",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (floatSafeRemainder(input.data, check.value) !== 0) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "finite") {
            if (!Number.isFinite(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_finite,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodNumber({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodNumber({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      int(message) {
        return this._addCheck({
          kind: "int",
          message: errorUtil.toString(message)
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil.toString(message)
        });
      }
      finite(message) {
        return this._addCheck({
          kind: "finite",
          message: errorUtil.toString(message)
        });
      }
      safe(message) {
        return this._addCheck({
          kind: "min",
          inclusive: true,
          value: Number.MIN_SAFE_INTEGER,
          message: errorUtil.toString(message)
        })._addCheck({
          kind: "max",
          inclusive: true,
          value: Number.MAX_SAFE_INTEGER,
          message: errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
      get isInt() {
        return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
      }
      get isFinite() {
        let max = null;
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
            return true;
          } else if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          } else if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return Number.isFinite(min) && Number.isFinite(max);
      }
    };
    ZodNumber.create = (params) => {
      return new ZodNumber({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodNumber,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    ZodBigInt = class _ZodBigInt extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
      }
      _parse(input) {
        if (this._def.coerce) {
          try {
            input.data = BigInt(input.data);
          } catch {
            return this._getInvalidInput(input);
          }
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.bigint) {
          return this._getInvalidInput(input);
        }
        let ctx = void 0;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                type: "bigint",
                minimum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                type: "bigint",
                maximum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (input.data % check.value !== BigInt(0)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _getInvalidInput(input) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.bigint,
          received: ctx.parsedType
        });
        return INVALID;
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodBigInt({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodBigInt({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    ZodBigInt.create = (params) => {
      return new ZodBigInt({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodBigInt,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    ZodBoolean = class extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = Boolean(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.boolean) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.boolean,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodBoolean.create = (params) => {
      return new ZodBoolean({
        typeName: ZodFirstPartyTypeKind.ZodBoolean,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    ZodDate = class _ZodDate extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = new Date(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.date) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.date,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        if (Number.isNaN(input.data.getTime())) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_date
          });
          return INVALID;
        }
        const status = new ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.getTime() < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                message: check.message,
                inclusive: true,
                exact: false,
                minimum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.getTime() > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                message: check.message,
                inclusive: true,
                exact: false,
                maximum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return {
          status: status.value,
          value: new Date(input.data.getTime())
        };
      }
      _addCheck(check) {
        return new _ZodDate({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      min(minDate, message) {
        return this._addCheck({
          kind: "min",
          value: minDate.getTime(),
          message: errorUtil.toString(message)
        });
      }
      max(maxDate, message) {
        return this._addCheck({
          kind: "max",
          value: maxDate.getTime(),
          message: errorUtil.toString(message)
        });
      }
      get minDate() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min != null ? new Date(min) : null;
      }
      get maxDate() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max != null ? new Date(max) : null;
      }
    };
    ZodDate.create = (params) => {
      return new ZodDate({
        checks: [],
        coerce: params?.coerce || false,
        typeName: ZodFirstPartyTypeKind.ZodDate,
        ...processCreateParams(params)
      });
    };
    ZodSymbol = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.symbol) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.symbol,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodSymbol.create = (params) => {
      return new ZodSymbol({
        typeName: ZodFirstPartyTypeKind.ZodSymbol,
        ...processCreateParams(params)
      });
    };
    ZodUndefined = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.undefined,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodUndefined.create = (params) => {
      return new ZodUndefined({
        typeName: ZodFirstPartyTypeKind.ZodUndefined,
        ...processCreateParams(params)
      });
    };
    ZodNull = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.null) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.null,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodNull.create = (params) => {
      return new ZodNull({
        typeName: ZodFirstPartyTypeKind.ZodNull,
        ...processCreateParams(params)
      });
    };
    ZodAny = class extends ZodType {
      constructor() {
        super(...arguments);
        this._any = true;
      }
      _parse(input) {
        return OK(input.data);
      }
    };
    ZodAny.create = (params) => {
      return new ZodAny({
        typeName: ZodFirstPartyTypeKind.ZodAny,
        ...processCreateParams(params)
      });
    };
    ZodUnknown = class extends ZodType {
      constructor() {
        super(...arguments);
        this._unknown = true;
      }
      _parse(input) {
        return OK(input.data);
      }
    };
    ZodUnknown.create = (params) => {
      return new ZodUnknown({
        typeName: ZodFirstPartyTypeKind.ZodUnknown,
        ...processCreateParams(params)
      });
    };
    ZodNever = class extends ZodType {
      _parse(input) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.never,
          received: ctx.parsedType
        });
        return INVALID;
      }
    };
    ZodNever.create = (params) => {
      return new ZodNever({
        typeName: ZodFirstPartyTypeKind.ZodNever,
        ...processCreateParams(params)
      });
    };
    ZodVoid = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.void,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodVoid.create = (params) => {
      return new ZodVoid({
        typeName: ZodFirstPartyTypeKind.ZodVoid,
        ...processCreateParams(params)
      });
    };
    ZodArray = class _ZodArray extends ZodType {
      _parse(input) {
        const { ctx, status } = this._processInputParams(input);
        const def = this._def;
        if (ctx.parsedType !== ZodParsedType.array) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: ctx.parsedType
          });
          return INVALID;
        }
        if (def.exactLength !== null) {
          const tooBig = ctx.data.length > def.exactLength.value;
          const tooSmall = ctx.data.length < def.exactLength.value;
          if (tooBig || tooSmall) {
            addIssueToContext(ctx, {
              code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
              minimum: tooSmall ? def.exactLength.value : void 0,
              maximum: tooBig ? def.exactLength.value : void 0,
              type: "array",
              inclusive: true,
              exact: true,
              message: def.exactLength.message
            });
            status.dirty();
          }
        }
        if (def.minLength !== null) {
          if (ctx.data.length < def.minLength.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: def.minLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.minLength.message
            });
            status.dirty();
          }
        }
        if (def.maxLength !== null) {
          if (ctx.data.length > def.maxLength.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: def.maxLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.maxLength.message
            });
            status.dirty();
          }
        }
        if (ctx.common.async) {
          return Promise.all([...ctx.data].map((item, i) => {
            return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
          })).then((result2) => {
            return ParseStatus.mergeArray(status, result2);
          });
        }
        const result = [...ctx.data].map((item, i) => {
          return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        });
        return ParseStatus.mergeArray(status, result);
      }
      get element() {
        return this._def.type;
      }
      min(minLength, message) {
        return new _ZodArray({
          ...this._def,
          minLength: { value: minLength, message: errorUtil.toString(message) }
        });
      }
      max(maxLength, message) {
        return new _ZodArray({
          ...this._def,
          maxLength: { value: maxLength, message: errorUtil.toString(message) }
        });
      }
      length(len, message) {
        return new _ZodArray({
          ...this._def,
          exactLength: { value: len, message: errorUtil.toString(message) }
        });
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    ZodArray.create = (schema2, params) => {
      return new ZodArray({
        type: schema2,
        minLength: null,
        maxLength: null,
        exactLength: null,
        typeName: ZodFirstPartyTypeKind.ZodArray,
        ...processCreateParams(params)
      });
    };
    ZodObject = class _ZodObject extends ZodType {
      constructor() {
        super(...arguments);
        this._cached = null;
        this.nonstrict = this.passthrough;
        this.augment = this.extend;
      }
      _getCached() {
        if (this._cached !== null)
          return this._cached;
        const shape = this._def.shape();
        const keys = util.objectKeys(shape);
        this._cached = { shape, keys };
        return this._cached;
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.object) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        const { status, ctx } = this._processInputParams(input);
        const { shape, keys: shapeKeys } = this._getCached();
        const extraKeys = [];
        if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
          for (const key in ctx.data) {
            if (!shapeKeys.includes(key)) {
              extraKeys.push(key);
            }
          }
        }
        const pairs = [];
        for (const key of shapeKeys) {
          const keyValidator = shape[key];
          const value = ctx.data[key];
          pairs.push({
            key: { status: "valid", value: key },
            value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (this._def.catchall instanceof ZodNever) {
          const unknownKeys = this._def.unknownKeys;
          if (unknownKeys === "passthrough") {
            for (const key of extraKeys) {
              pairs.push({
                key: { status: "valid", value: key },
                value: { status: "valid", value: ctx.data[key] }
              });
            }
          } else if (unknownKeys === "strict") {
            if (extraKeys.length > 0) {
              addIssueToContext(ctx, {
                code: ZodIssueCode.unrecognized_keys,
                keys: extraKeys
              });
              status.dirty();
            }
          } else if (unknownKeys === "strip") {
          } else {
            throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
          }
        } else {
          const catchall = this._def.catchall;
          for (const key of extraKeys) {
            const value = ctx.data[key];
            pairs.push({
              key: { status: "valid", value: key },
              value: catchall._parse(
                new ParseInputLazyPath(ctx, value, ctx.path, key)
                //, ctx.child(key), value, getParsedType(value)
              ),
              alwaysSet: key in ctx.data
            });
          }
        }
        if (ctx.common.async) {
          return Promise.resolve().then(async () => {
            const syncPairs = [];
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              syncPairs.push({
                key,
                value,
                alwaysSet: pair.alwaysSet
              });
            }
            return syncPairs;
          }).then((syncPairs) => {
            return ParseStatus.mergeObjectSync(status, syncPairs);
          });
        } else {
          return ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get shape() {
        return this._def.shape();
      }
      strict(message) {
        errorUtil.errToObj;
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strict",
          ...message !== void 0 ? {
            errorMap: (issue, ctx) => {
              const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
              if (issue.code === "unrecognized_keys")
                return {
                  message: errorUtil.errToObj(message).message ?? defaultError
                };
              return {
                message: defaultError
              };
            }
          } : {}
        });
      }
      strip() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strip"
        });
      }
      passthrough() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "passthrough"
        });
      }
      // const AugmentFactory =
      //   <Def extends ZodObjectDef>(def: Def) =>
      //   <Augmentation extends ZodRawShape>(
      //     augmentation: Augmentation
      //   ): ZodObject<
      //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
      //     Def["unknownKeys"],
      //     Def["catchall"]
      //   > => {
      //     return new ZodObject({
      //       ...def,
      //       shape: () => ({
      //         ...def.shape(),
      //         ...augmentation,
      //       }),
      //     }) as any;
      //   };
      extend(augmentation) {
        return new _ZodObject({
          ...this._def,
          shape: () => ({
            ...this._def.shape(),
            ...augmentation
          })
        });
      }
      /**
       * Prior to zod@1.0.12 there was a bug in the
       * inferred type of merged objects. Please
       * upgrade if you are experiencing issues.
       */
      merge(merging) {
        const merged = new _ZodObject({
          unknownKeys: merging._def.unknownKeys,
          catchall: merging._def.catchall,
          shape: () => ({
            ...this._def.shape(),
            ...merging._def.shape()
          }),
          typeName: ZodFirstPartyTypeKind.ZodObject
        });
        return merged;
      }
      // merge<
      //   Incoming extends AnyZodObject,
      //   Augmentation extends Incoming["shape"],
      //   NewOutput extends {
      //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
      //       ? Augmentation[k]["_output"]
      //       : k extends keyof Output
      //       ? Output[k]
      //       : never;
      //   },
      //   NewInput extends {
      //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
      //       ? Augmentation[k]["_input"]
      //       : k extends keyof Input
      //       ? Input[k]
      //       : never;
      //   }
      // >(
      //   merging: Incoming
      // ): ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"],
      //   NewOutput,
      //   NewInput
      // > {
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      setKey(key, schema2) {
        return this.augment({ [key]: schema2 });
      }
      // merge<Incoming extends AnyZodObject>(
      //   merging: Incoming
      // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
      // ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"]
      // > {
      //   // const mergedShape = objectUtil.mergeShapes(
      //   //   this._def.shape(),
      //   //   merging._def.shape()
      //   // );
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      catchall(index) {
        return new _ZodObject({
          ...this._def,
          catchall: index
        });
      }
      pick(mask) {
        const shape = {};
        for (const key of util.objectKeys(mask)) {
          if (mask[key] && this.shape[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => shape
        });
      }
      omit(mask) {
        const shape = {};
        for (const key of util.objectKeys(this.shape)) {
          if (!mask[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => shape
        });
      }
      /**
       * @deprecated
       */
      deepPartial() {
        return deepPartialify(this);
      }
      partial(mask) {
        const newShape = {};
        for (const key of util.objectKeys(this.shape)) {
          const fieldSchema = this.shape[key];
          if (mask && !mask[key]) {
            newShape[key] = fieldSchema;
          } else {
            newShape[key] = fieldSchema.optional();
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => newShape
        });
      }
      required(mask) {
        const newShape = {};
        for (const key of util.objectKeys(this.shape)) {
          if (mask && !mask[key]) {
            newShape[key] = this.shape[key];
          } else {
            const fieldSchema = this.shape[key];
            let newField = fieldSchema;
            while (newField instanceof ZodOptional) {
              newField = newField._def.innerType;
            }
            newShape[key] = newField;
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => newShape
        });
      }
      keyof() {
        return createZodEnum(util.objectKeys(this.shape));
      }
    };
    ZodObject.create = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.strictCreate = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strict",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.lazycreate = (shape, params) => {
      return new ZodObject({
        shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodUnion = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const options = this._def.options;
        function handleResults(results) {
          for (const result of results) {
            if (result.result.status === "valid") {
              return result.result;
            }
          }
          for (const result of results) {
            if (result.result.status === "dirty") {
              ctx.common.issues.push(...result.ctx.common.issues);
              return result.result;
            }
          }
          const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union,
            unionErrors
          });
          return INVALID;
        }
        if (ctx.common.async) {
          return Promise.all(options.map(async (option) => {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            return {
              result: await option._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: childCtx
              }),
              ctx: childCtx
            };
          })).then(handleResults);
        } else {
          let dirty = void 0;
          const issues = [];
          for (const option of options) {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            const result = option._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: childCtx
            });
            if (result.status === "valid") {
              return result;
            } else if (result.status === "dirty" && !dirty) {
              dirty = { result, ctx: childCtx };
            }
            if (childCtx.common.issues.length) {
              issues.push(childCtx.common.issues);
            }
          }
          if (dirty) {
            ctx.common.issues.push(...dirty.ctx.common.issues);
            return dirty.result;
          }
          const unionErrors = issues.map((issues2) => new ZodError(issues2));
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union,
            unionErrors
          });
          return INVALID;
        }
      }
      get options() {
        return this._def.options;
      }
    };
    ZodUnion.create = (types, params) => {
      return new ZodUnion({
        options: types,
        typeName: ZodFirstPartyTypeKind.ZodUnion,
        ...processCreateParams(params)
      });
    };
    getDiscriminator = (type) => {
      if (type instanceof ZodLazy) {
        return getDiscriminator(type.schema);
      } else if (type instanceof ZodEffects) {
        return getDiscriminator(type.innerType());
      } else if (type instanceof ZodLiteral) {
        return [type.value];
      } else if (type instanceof ZodEnum) {
        return type.options;
      } else if (type instanceof ZodNativeEnum) {
        return util.objectValues(type.enum);
      } else if (type instanceof ZodDefault) {
        return getDiscriminator(type._def.innerType);
      } else if (type instanceof ZodUndefined) {
        return [void 0];
      } else if (type instanceof ZodNull) {
        return [null];
      } else if (type instanceof ZodOptional) {
        return [void 0, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodNullable) {
        return [null, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodBranded) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodReadonly) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodCatch) {
        return getDiscriminator(type._def.innerType);
      } else {
        return [];
      }
    };
    ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const discriminator = this.discriminator;
        const discriminatorValue = ctx.data[discriminator];
        const option = this.optionsMap.get(discriminatorValue);
        if (!option) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union_discriminator,
            options: Array.from(this.optionsMap.keys()),
            path: [discriminator]
          });
          return INVALID;
        }
        if (ctx.common.async) {
          return option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        } else {
          return option._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        }
      }
      get discriminator() {
        return this._def.discriminator;
      }
      get options() {
        return this._def.options;
      }
      get optionsMap() {
        return this._def.optionsMap;
      }
      /**
       * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
       * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
       * have a different value for each object in the union.
       * @param discriminator the name of the discriminator property
       * @param types an array of object schemas
       * @param params
       */
      static create(discriminator, options, params) {
        const optionsMap = /* @__PURE__ */ new Map();
        for (const type of options) {
          const discriminatorValues = getDiscriminator(type.shape[discriminator]);
          if (!discriminatorValues.length) {
            throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
          }
          for (const value of discriminatorValues) {
            if (optionsMap.has(value)) {
              throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
            }
            optionsMap.set(value, type);
          }
        }
        return new _ZodDiscriminatedUnion({
          typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
          discriminator,
          options,
          optionsMap,
          ...processCreateParams(params)
        });
      }
    };
    ZodIntersection = class extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const handleParsed = (parsedLeft, parsedRight) => {
          if (isAborted(parsedLeft) || isAborted(parsedRight)) {
            return INVALID;
          }
          const merged = mergeValues(parsedLeft.value, parsedRight.value);
          if (!merged.valid) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_intersection_types
            });
            return INVALID;
          }
          if (isDirty(parsedLeft) || isDirty(parsedRight)) {
            status.dirty();
          }
          return { status: status.value, value: merged.data };
        };
        if (ctx.common.async) {
          return Promise.all([
            this._def.left._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            }),
            this._def.right._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            })
          ]).then(([left, right]) => handleParsed(left, right));
        } else {
          return handleParsed(this._def.left._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }), this._def.right._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }));
        }
      }
    };
    ZodIntersection.create = (left, right, params) => {
      return new ZodIntersection({
        left,
        right,
        typeName: ZodFirstPartyTypeKind.ZodIntersection,
        ...processCreateParams(params)
      });
    };
    ZodTuple = class _ZodTuple extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.array) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: ctx.parsedType
          });
          return INVALID;
        }
        if (ctx.data.length < this._def.items.length) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          return INVALID;
        }
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          status.dirty();
        }
        const items = [...ctx.data].map((item, itemIndex) => {
          const schema2 = this._def.items[itemIndex] || this._def.rest;
          if (!schema2)
            return null;
          return schema2._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
        }).filter((x) => !!x);
        if (ctx.common.async) {
          return Promise.all(items).then((results) => {
            return ParseStatus.mergeArray(status, results);
          });
        } else {
          return ParseStatus.mergeArray(status, items);
        }
      }
      get items() {
        return this._def.items;
      }
      rest(rest) {
        return new _ZodTuple({
          ...this._def,
          rest
        });
      }
    };
    ZodTuple.create = (schemas, params) => {
      if (!Array.isArray(schemas)) {
        throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
      }
      return new ZodTuple({
        items: schemas,
        typeName: ZodFirstPartyTypeKind.ZodTuple,
        rest: null,
        ...processCreateParams(params)
      });
    };
    ZodRecord = class _ZodRecord extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const pairs = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        for (const key in ctx.data) {
          pairs.push({
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
            value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (ctx.common.async) {
          return ParseStatus.mergeObjectAsync(status, pairs);
        } else {
          return ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get element() {
        return this._def.valueType;
      }
      static create(first, second, third) {
        if (second instanceof ZodType) {
          return new _ZodRecord({
            keyType: first,
            valueType: second,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(third)
          });
        }
        return new _ZodRecord({
          keyType: ZodString.create(),
          valueType: first,
          typeName: ZodFirstPartyTypeKind.ZodRecord,
          ...processCreateParams(second)
        });
      }
    };
    ZodMap = class extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.map) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.map,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const pairs = [...ctx.data.entries()].map(([key, value], index) => {
          return {
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
            value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
          };
        });
        if (ctx.common.async) {
          const finalMap = /* @__PURE__ */ new Map();
          return Promise.resolve().then(async () => {
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              if (key.status === "aborted" || value.status === "aborted") {
                return INVALID;
              }
              if (key.status === "dirty" || value.status === "dirty") {
                status.dirty();
              }
              finalMap.set(key.value, value.value);
            }
            return { status: status.value, value: finalMap };
          });
        } else {
          const finalMap = /* @__PURE__ */ new Map();
          for (const pair of pairs) {
            const key = pair.key;
            const value = pair.value;
            if (key.status === "aborted" || value.status === "aborted") {
              return INVALID;
            }
            if (key.status === "dirty" || value.status === "dirty") {
              status.dirty();
            }
            finalMap.set(key.value, value.value);
          }
          return { status: status.value, value: finalMap };
        }
      }
    };
    ZodMap.create = (keyType, valueType, params) => {
      return new ZodMap({
        valueType,
        keyType,
        typeName: ZodFirstPartyTypeKind.ZodMap,
        ...processCreateParams(params)
      });
    };
    ZodSet = class _ZodSet extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.set) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.set,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const def = this._def;
        if (def.minSize !== null) {
          if (ctx.data.size < def.minSize.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: def.minSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.minSize.message
            });
            status.dirty();
          }
        }
        if (def.maxSize !== null) {
          if (ctx.data.size > def.maxSize.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: def.maxSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.maxSize.message
            });
            status.dirty();
          }
        }
        const valueType = this._def.valueType;
        function finalizeSet(elements2) {
          const parsedSet = /* @__PURE__ */ new Set();
          for (const element of elements2) {
            if (element.status === "aborted")
              return INVALID;
            if (element.status === "dirty")
              status.dirty();
            parsedSet.add(element.value);
          }
          return { status: status.value, value: parsedSet };
        }
        const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
        if (ctx.common.async) {
          return Promise.all(elements).then((elements2) => finalizeSet(elements2));
        } else {
          return finalizeSet(elements);
        }
      }
      min(minSize, message) {
        return new _ZodSet({
          ...this._def,
          minSize: { value: minSize, message: errorUtil.toString(message) }
        });
      }
      max(maxSize, message) {
        return new _ZodSet({
          ...this._def,
          maxSize: { value: maxSize, message: errorUtil.toString(message) }
        });
      }
      size(size, message) {
        return this.min(size, message).max(size, message);
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    ZodSet.create = (valueType, params) => {
      return new ZodSet({
        valueType,
        minSize: null,
        maxSize: null,
        typeName: ZodFirstPartyTypeKind.ZodSet,
        ...processCreateParams(params)
      });
    };
    ZodFunction = class _ZodFunction extends ZodType {
      constructor() {
        super(...arguments);
        this.validate = this.implement;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.function) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.function,
            received: ctx.parsedType
          });
          return INVALID;
        }
        function makeArgsIssue(args, error) {
          return makeIssue({
            data: args,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
            issueData: {
              code: ZodIssueCode.invalid_arguments,
              argumentsError: error
            }
          });
        }
        function makeReturnsIssue(returns, error) {
          return makeIssue({
            data: returns,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
            issueData: {
              code: ZodIssueCode.invalid_return_type,
              returnTypeError: error
            }
          });
        }
        const params = { errorMap: ctx.common.contextualErrorMap };
        const fn = ctx.data;
        if (this._def.returns instanceof ZodPromise) {
          const me = this;
          return OK(async function(...args) {
            const error = new ZodError([]);
            const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
              error.addIssue(makeArgsIssue(args, e));
              throw error;
            });
            const result = await Reflect.apply(fn, this, parsedArgs);
            const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
              error.addIssue(makeReturnsIssue(result, e));
              throw error;
            });
            return parsedReturns;
          });
        } else {
          const me = this;
          return OK(function(...args) {
            const parsedArgs = me._def.args.safeParse(args, params);
            if (!parsedArgs.success) {
              throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
            }
            const result = Reflect.apply(fn, this, parsedArgs.data);
            const parsedReturns = me._def.returns.safeParse(result, params);
            if (!parsedReturns.success) {
              throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
            }
            return parsedReturns.data;
          });
        }
      }
      parameters() {
        return this._def.args;
      }
      returnType() {
        return this._def.returns;
      }
      args(...items) {
        return new _ZodFunction({
          ...this._def,
          args: ZodTuple.create(items).rest(ZodUnknown.create())
        });
      }
      returns(returnType) {
        return new _ZodFunction({
          ...this._def,
          returns: returnType
        });
      }
      implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      static create(args, returns, params) {
        return new _ZodFunction({
          args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
          returns: returns || ZodUnknown.create(),
          typeName: ZodFirstPartyTypeKind.ZodFunction,
          ...processCreateParams(params)
        });
      }
    };
    ZodLazy = class extends ZodType {
      get schema() {
        return this._def.getter();
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const lazySchema = this._def.getter();
        return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
      }
    };
    ZodLazy.create = (getter, params) => {
      return new ZodLazy({
        getter,
        typeName: ZodFirstPartyTypeKind.ZodLazy,
        ...processCreateParams(params)
      });
    };
    ZodLiteral = class extends ZodType {
      _parse(input) {
        if (input.data !== this._def.value) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_literal,
            expected: this._def.value
          });
          return INVALID;
        }
        return { status: "valid", value: input.data };
      }
      get value() {
        return this._def.value;
      }
    };
    ZodLiteral.create = (value, params) => {
      return new ZodLiteral({
        value,
        typeName: ZodFirstPartyTypeKind.ZodLiteral,
        ...processCreateParams(params)
      });
    };
    ZodEnum = class _ZodEnum extends ZodType {
      _parse(input) {
        if (typeof input.data !== "string") {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          addIssueToContext(ctx, {
            expected: util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodIssueCode.invalid_type
          });
          return INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(this._def.values);
        }
        if (!this._cache.has(input.data)) {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return INVALID;
        }
        return OK(input.data);
      }
      get options() {
        return this._def.values;
      }
      get enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Values() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      extract(values, newDef = this._def) {
        return _ZodEnum.create(values, {
          ...this._def,
          ...newDef
        });
      }
      exclude(values, newDef = this._def) {
        return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
          ...this._def,
          ...newDef
        });
      }
    };
    ZodEnum.create = createZodEnum;
    ZodNativeEnum = class extends ZodType {
      _parse(input) {
        const nativeEnumValues = util.getValidEnumValues(this._def.values);
        const ctx = this._getOrReturnCtx(input);
        if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
          const expectedValues = util.objectValues(nativeEnumValues);
          addIssueToContext(ctx, {
            expected: util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodIssueCode.invalid_type
          });
          return INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(util.getValidEnumValues(this._def.values));
        }
        if (!this._cache.has(input.data)) {
          const expectedValues = util.objectValues(nativeEnumValues);
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return INVALID;
        }
        return OK(input.data);
      }
      get enum() {
        return this._def.values;
      }
    };
    ZodNativeEnum.create = (values, params) => {
      return new ZodNativeEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
        ...processCreateParams(params)
      });
    };
    ZodPromise = class extends ZodType {
      unwrap() {
        return this._def.type;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.promise,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
        return OK(promisified.then((data) => {
          return this._def.type.parseAsync(data, {
            path: ctx.path,
            errorMap: ctx.common.contextualErrorMap
          });
        }));
      }
    };
    ZodPromise.create = (schema2, params) => {
      return new ZodPromise({
        type: schema2,
        typeName: ZodFirstPartyTypeKind.ZodPromise,
        ...processCreateParams(params)
      });
    };
    ZodEffects = class extends ZodType {
      innerType() {
        return this._def.schema;
      }
      sourceType() {
        return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const effect = this._def.effect || null;
        const checkCtx = {
          addIssue: (arg) => {
            addIssueToContext(ctx, arg);
            if (arg.fatal) {
              status.abort();
            } else {
              status.dirty();
            }
          },
          get path() {
            return ctx.path;
          }
        };
        checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
        if (effect.type === "preprocess") {
          const processed = effect.transform(ctx.data, checkCtx);
          if (ctx.common.async) {
            return Promise.resolve(processed).then(async (processed2) => {
              if (status.value === "aborted")
                return INVALID;
              const result = await this._def.schema._parseAsync({
                data: processed2,
                path: ctx.path,
                parent: ctx
              });
              if (result.status === "aborted")
                return INVALID;
              if (result.status === "dirty")
                return DIRTY(result.value);
              if (status.value === "dirty")
                return DIRTY(result.value);
              return result;
            });
          } else {
            if (status.value === "aborted")
              return INVALID;
            const result = this._def.schema._parseSync({
              data: processed,
              path: ctx.path,
              parent: ctx
            });
            if (result.status === "aborted")
              return INVALID;
            if (result.status === "dirty")
              return DIRTY(result.value);
            if (status.value === "dirty")
              return DIRTY(result.value);
            return result;
          }
        }
        if (effect.type === "refinement") {
          const executeRefinement = (acc) => {
            const result = effect.refinement(acc, checkCtx);
            if (ctx.common.async) {
              return Promise.resolve(result);
            }
            if (result instanceof Promise) {
              throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
            }
            return acc;
          };
          if (ctx.common.async === false) {
            const inner = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inner.status === "aborted")
              return INVALID;
            if (inner.status === "dirty")
              status.dirty();
            executeRefinement(inner.value);
            return { status: status.value, value: inner.value };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
              if (inner.status === "aborted")
                return INVALID;
              if (inner.status === "dirty")
                status.dirty();
              return executeRefinement(inner.value).then(() => {
                return { status: status.value, value: inner.value };
              });
            });
          }
        }
        if (effect.type === "transform") {
          if (ctx.common.async === false) {
            const base = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (!isValid(base))
              return INVALID;
            const result = effect.transform(base.value, checkCtx);
            if (result instanceof Promise) {
              throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
            }
            return { status: status.value, value: result };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
              if (!isValid(base))
                return INVALID;
              return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
                status: status.value,
                value: result
              }));
            });
          }
        }
        util.assertNever(effect);
      }
    };
    ZodEffects.create = (schema2, effect, params) => {
      return new ZodEffects({
        schema: schema2,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect,
        ...processCreateParams(params)
      });
    };
    ZodEffects.createWithPreprocess = (preprocess, schema2, params) => {
      return new ZodEffects({
        schema: schema2,
        effect: { type: "preprocess", transform: preprocess },
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        ...processCreateParams(params)
      });
    };
    ZodOptional = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.undefined) {
          return OK(void 0);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodOptional.create = (type, params) => {
      return new ZodOptional({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodOptional,
        ...processCreateParams(params)
      });
    };
    ZodNullable = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.null) {
          return OK(null);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodNullable.create = (type, params) => {
      return new ZodNullable({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodNullable,
        ...processCreateParams(params)
      });
    };
    ZodDefault = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        let data = ctx.data;
        if (ctx.parsedType === ZodParsedType.undefined) {
          data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      removeDefault() {
        return this._def.innerType;
      }
    };
    ZodDefault.create = (type, params) => {
      return new ZodDefault({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodDefault,
        defaultValue: typeof params.default === "function" ? params.default : () => params.default,
        ...processCreateParams(params)
      });
    };
    ZodCatch = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const newCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          }
        };
        const result = this._def.innerType._parse({
          data: newCtx.data,
          path: newCtx.path,
          parent: {
            ...newCtx
          }
        });
        if (isAsync(result)) {
          return result.then((result2) => {
            return {
              status: "valid",
              value: result2.status === "valid" ? result2.value : this._def.catchValue({
                get error() {
                  return new ZodError(newCtx.common.issues);
                },
                input: newCtx.data
              })
            };
          });
        } else {
          return {
            status: "valid",
            value: result.status === "valid" ? result.value : this._def.catchValue({
              get error() {
                return new ZodError(newCtx.common.issues);
              },
              input: newCtx.data
            })
          };
        }
      }
      removeCatch() {
        return this._def.innerType;
      }
    };
    ZodCatch.create = (type, params) => {
      return new ZodCatch({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodCatch,
        catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
        ...processCreateParams(params)
      });
    };
    ZodNaN = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.nan) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.nan,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return { status: "valid", value: input.data };
      }
    };
    ZodNaN.create = (params) => {
      return new ZodNaN({
        typeName: ZodFirstPartyTypeKind.ZodNaN,
        ...processCreateParams(params)
      });
    };
    BRAND = Symbol("zod_brand");
    ZodBranded = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const data = ctx.data;
        return this._def.type._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      unwrap() {
        return this._def.type;
      }
    };
    ZodPipeline = class _ZodPipeline extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.common.async) {
          const handleAsync = async () => {
            const inResult = await this._def.in._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inResult.status === "aborted")
              return INVALID;
            if (inResult.status === "dirty") {
              status.dirty();
              return DIRTY(inResult.value);
            } else {
              return this._def.out._parseAsync({
                data: inResult.value,
                path: ctx.path,
                parent: ctx
              });
            }
          };
          return handleAsync();
        } else {
          const inResult = this._def.in._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inResult.status === "aborted")
            return INVALID;
          if (inResult.status === "dirty") {
            status.dirty();
            return {
              status: "dirty",
              value: inResult.value
            };
          } else {
            return this._def.out._parseSync({
              data: inResult.value,
              path: ctx.path,
              parent: ctx
            });
          }
        }
      }
      static create(a, b) {
        return new _ZodPipeline({
          in: a,
          out: b,
          typeName: ZodFirstPartyTypeKind.ZodPipeline
        });
      }
    };
    ZodReadonly = class extends ZodType {
      _parse(input) {
        const result = this._def.innerType._parse(input);
        const freeze = (data) => {
          if (isValid(data)) {
            data.value = Object.freeze(data.value);
          }
          return data;
        };
        return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodReadonly.create = (type, params) => {
      return new ZodReadonly({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodReadonly,
        ...processCreateParams(params)
      });
    };
    late = {
      object: ZodObject.lazycreate
    };
    (function(ZodFirstPartyTypeKind2) {
      ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
      ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
      ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
      ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
      ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
      ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
      ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
      ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
      ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
      ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
      ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
      ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
      ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
      ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
      ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
      ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
      ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
      ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
      ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
      ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
      ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
      ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
      ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
      ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
      ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
      ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
      ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
      ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
      ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
      ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
      ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
      ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
      ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
      ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
      ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
      ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
    })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
    instanceOfType = (cls, params = {
      message: `Input not instance of ${cls.name}`
    }) => custom((data) => data instanceof cls, params);
    stringType = ZodString.create;
    numberType = ZodNumber.create;
    nanType = ZodNaN.create;
    bigIntType = ZodBigInt.create;
    booleanType = ZodBoolean.create;
    dateType = ZodDate.create;
    symbolType = ZodSymbol.create;
    undefinedType = ZodUndefined.create;
    nullType = ZodNull.create;
    anyType = ZodAny.create;
    unknownType = ZodUnknown.create;
    neverType = ZodNever.create;
    voidType = ZodVoid.create;
    arrayType = ZodArray.create;
    objectType = ZodObject.create;
    strictObjectType = ZodObject.strictCreate;
    unionType = ZodUnion.create;
    discriminatedUnionType = ZodDiscriminatedUnion.create;
    intersectionType = ZodIntersection.create;
    tupleType = ZodTuple.create;
    recordType = ZodRecord.create;
    mapType = ZodMap.create;
    setType = ZodSet.create;
    functionType = ZodFunction.create;
    lazyType = ZodLazy.create;
    literalType = ZodLiteral.create;
    enumType = ZodEnum.create;
    nativeEnumType = ZodNativeEnum.create;
    promiseType = ZodPromise.create;
    effectsType = ZodEffects.create;
    optionalType = ZodOptional.create;
    nullableType = ZodNullable.create;
    preprocessType = ZodEffects.createWithPreprocess;
    pipelineType = ZodPipeline.create;
    ostring = () => stringType().optional();
    onumber = () => numberType().optional();
    oboolean = () => booleanType().optional();
    coerce = {
      string: ((arg) => ZodString.create({ ...arg, coerce: true })),
      number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
      boolean: ((arg) => ZodBoolean.create({
        ...arg,
        coerce: true
      })),
      bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
      date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
    };
    NEVER = INVALID;
  }
});

// node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});
var init_external = __esm({
  "node_modules/zod/v3/external.js"() {
    init_errors();
    init_parseUtil();
    init_typeAliases();
    init_util();
    init_types();
    init_ZodError();
  }
});

// node_modules/zod/index.js
var init_zod = __esm({
  "node_modules/zod/index.js"() {
    init_external();
    init_external();
  }
});

// node_modules/yaml/dist/nodes/identity.js
var require_identity = __commonJS({
  "node_modules/yaml/dist/nodes/identity.js"(exports2) {
    "use strict";
    var ALIAS = Symbol.for("yaml.alias");
    var DOC = Symbol.for("yaml.document");
    var MAP = Symbol.for("yaml.map");
    var PAIR = Symbol.for("yaml.pair");
    var SCALAR = Symbol.for("yaml.scalar");
    var SEQ = Symbol.for("yaml.seq");
    var NODE_TYPE = Symbol.for("yaml.node.type");
    var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
    var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
    var isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
    var isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
    var isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
    var isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
    function isCollection(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case MAP:
          case SEQ:
            return true;
        }
      return false;
    }
    function isNode(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case ALIAS:
          case MAP:
          case SCALAR:
          case SEQ:
            return true;
        }
      return false;
    }
    var hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;
    exports2.ALIAS = ALIAS;
    exports2.DOC = DOC;
    exports2.MAP = MAP;
    exports2.NODE_TYPE = NODE_TYPE;
    exports2.PAIR = PAIR;
    exports2.SCALAR = SCALAR;
    exports2.SEQ = SEQ;
    exports2.hasAnchor = hasAnchor;
    exports2.isAlias = isAlias;
    exports2.isCollection = isCollection;
    exports2.isDocument = isDocument;
    exports2.isMap = isMap;
    exports2.isNode = isNode;
    exports2.isPair = isPair;
    exports2.isScalar = isScalar;
    exports2.isSeq = isSeq;
  }
});

// node_modules/yaml/dist/visit.js
var require_visit = __commonJS({
  "node_modules/yaml/dist/visit.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var BREAK = Symbol("break visit");
    var SKIP = Symbol("skip children");
    var REMOVE = Symbol("remove node");
    function visit2(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        visit_(null, node, visitor_, Object.freeze([]));
    }
    visit2.BREAK = BREAK;
    visit2.SKIP = SKIP;
    visit2.REMOVE = REMOVE;
    function visit_(key, node, visitor, path20) {
      const ctrl = callVisitor(key, node, visitor, path20);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path20, ctrl);
        return visit_(key, ctrl, visitor, path20);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path20 = Object.freeze(path20.concat(node));
          for (let i = 0; i < node.items.length; ++i) {
            const ci = visit_(i, node.items[i], visitor, path20);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path20 = Object.freeze(path20.concat(node));
          const ck = visit_("key", node.key, visitor, path20);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = visit_("value", node.value, visitor, path20);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    async function visitAsync(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        await visitAsync_(null, node, visitor_, Object.freeze([]));
    }
    visitAsync.BREAK = BREAK;
    visitAsync.SKIP = SKIP;
    visitAsync.REMOVE = REMOVE;
    async function visitAsync_(key, node, visitor, path20) {
      const ctrl = await callVisitor(key, node, visitor, path20);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path20, ctrl);
        return visitAsync_(key, ctrl, visitor, path20);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path20 = Object.freeze(path20.concat(node));
          for (let i = 0; i < node.items.length; ++i) {
            const ci = await visitAsync_(i, node.items[i], visitor, path20);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path20 = Object.freeze(path20.concat(node));
          const ck = await visitAsync_("key", node.key, visitor, path20);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = await visitAsync_("value", node.value, visitor, path20);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    function initVisitor(visitor) {
      if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
        return Object.assign({
          Alias: visitor.Node,
          Map: visitor.Node,
          Scalar: visitor.Node,
          Seq: visitor.Node
        }, visitor.Value && {
          Map: visitor.Value,
          Scalar: visitor.Value,
          Seq: visitor.Value
        }, visitor.Collection && {
          Map: visitor.Collection,
          Seq: visitor.Collection
        }, visitor);
      }
      return visitor;
    }
    function callVisitor(key, node, visitor, path20) {
      if (typeof visitor === "function")
        return visitor(key, node, path20);
      if (identity.isMap(node))
        return visitor.Map?.(key, node, path20);
      if (identity.isSeq(node))
        return visitor.Seq?.(key, node, path20);
      if (identity.isPair(node))
        return visitor.Pair?.(key, node, path20);
      if (identity.isScalar(node))
        return visitor.Scalar?.(key, node, path20);
      if (identity.isAlias(node))
        return visitor.Alias?.(key, node, path20);
      return void 0;
    }
    function replaceNode(key, path20, node) {
      const parent = path20[path20.length - 1];
      if (identity.isCollection(parent)) {
        parent.items[key] = node;
      } else if (identity.isPair(parent)) {
        if (key === "key")
          parent.key = node;
        else
          parent.value = node;
      } else if (identity.isDocument(parent)) {
        parent.contents = node;
      } else {
        const pt = identity.isAlias(parent) ? "alias" : "scalar";
        throw new Error(`Cannot replace node with ${pt} parent`);
      }
    }
    exports2.visit = visit2;
    exports2.visitAsync = visitAsync;
  }
});

// node_modules/yaml/dist/doc/directives.js
var require_directives = __commonJS({
  "node_modules/yaml/dist/doc/directives.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var visit2 = require_visit();
    var escapeChars = {
      "!": "%21",
      ",": "%2C",
      "[": "%5B",
      "]": "%5D",
      "{": "%7B",
      "}": "%7D"
    };
    var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
    var Directives = class _Directives {
      constructor(yaml, tags) {
        this.docStart = null;
        this.docEnd = false;
        this.yaml = Object.assign({}, _Directives.defaultYaml, yaml);
        this.tags = Object.assign({}, _Directives.defaultTags, tags);
      }
      clone() {
        const copy = new _Directives(this.yaml, this.tags);
        copy.docStart = this.docStart;
        return copy;
      }
      /**
       * During parsing, get a Directives instance for the current document and
       * update the stream state according to the current version's spec.
       */
      atDocument() {
        const res = new _Directives(this.yaml, this.tags);
        switch (this.yaml.version) {
          case "1.1":
            this.atNextDocument = true;
            break;
          case "1.2":
            this.atNextDocument = false;
            this.yaml = {
              explicit: _Directives.defaultYaml.explicit,
              version: "1.2"
            };
            this.tags = Object.assign({}, _Directives.defaultTags);
            break;
        }
        return res;
      }
      /**
       * @param onError - May be called even if the action was successful
       * @returns `true` on success
       */
      add(line, onError) {
        if (this.atNextDocument) {
          this.yaml = { explicit: _Directives.defaultYaml.explicit, version: "1.1" };
          this.tags = Object.assign({}, _Directives.defaultTags);
          this.atNextDocument = false;
        }
        const parts = line.trim().split(/[ \t]+/);
        const name = parts.shift();
        switch (name) {
          case "%TAG": {
            if (parts.length !== 2) {
              onError(0, "%TAG directive should contain exactly two parts");
              if (parts.length < 2)
                return false;
            }
            const [handle, prefix] = parts;
            this.tags[handle] = prefix;
            return true;
          }
          case "%YAML": {
            this.yaml.explicit = true;
            if (parts.length !== 1) {
              onError(0, "%YAML directive should contain exactly one part");
              return false;
            }
            const [version] = parts;
            if (version === "1.1" || version === "1.2") {
              this.yaml.version = version;
              return true;
            } else {
              const isValid2 = /^\d+\.\d+$/.test(version);
              onError(6, `Unsupported YAML version ${version}`, isValid2);
              return false;
            }
          }
          default:
            onError(0, `Unknown directive ${name}`, true);
            return false;
        }
      }
      /**
       * Resolves a tag, matching handles to those defined in %TAG directives.
       *
       * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
       *   `'!local'` tag, or `null` if unresolvable.
       */
      tagName(source, onError) {
        if (source === "!")
          return "!";
        if (source[0] !== "!") {
          onError(`Not a valid tag: ${source}`);
          return null;
        }
        if (source[1] === "<") {
          const verbatim = source.slice(2, -1);
          if (verbatim === "!" || verbatim === "!!") {
            onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
            return null;
          }
          if (source[source.length - 1] !== ">")
            onError("Verbatim tags must end with a >");
          return verbatim;
        }
        const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
        if (!suffix)
          onError(`The ${source} tag has no suffix`);
        const prefix = this.tags[handle];
        if (prefix) {
          try {
            return prefix + decodeURIComponent(suffix);
          } catch (error) {
            onError(String(error));
            return null;
          }
        }
        if (handle === "!")
          return source;
        onError(`Could not resolve tag: ${source}`);
        return null;
      }
      /**
       * Given a fully resolved tag, returns its printable string form,
       * taking into account current tag prefixes and defaults.
       */
      tagString(tag) {
        for (const [handle, prefix] of Object.entries(this.tags)) {
          if (tag.startsWith(prefix))
            return handle + escapeTagName(tag.substring(prefix.length));
        }
        return tag[0] === "!" ? tag : `!<${tag}>`;
      }
      toString(doc) {
        const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
        const tagEntries = Object.entries(this.tags);
        let tagNames;
        if (doc && tagEntries.length > 0 && identity.isNode(doc.contents)) {
          const tags = {};
          visit2.visit(doc.contents, (_key, node) => {
            if (identity.isNode(node) && node.tag)
              tags[node.tag] = true;
          });
          tagNames = Object.keys(tags);
        } else
          tagNames = [];
        for (const [handle, prefix] of tagEntries) {
          if (handle === "!!" && prefix === "tag:yaml.org,2002:")
            continue;
          if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
            lines.push(`%TAG ${handle} ${prefix}`);
        }
        return lines.join("\n");
      }
    };
    Directives.defaultYaml = { explicit: false, version: "1.2" };
    Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
    exports2.Directives = Directives;
  }
});

// node_modules/yaml/dist/doc/anchors.js
var require_anchors = __commonJS({
  "node_modules/yaml/dist/doc/anchors.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var visit2 = require_visit();
    function anchorIsValid(anchor) {
      if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
        const sa = JSON.stringify(anchor);
        const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
        throw new Error(msg);
      }
      return true;
    }
    function anchorNames(root) {
      const anchors = /* @__PURE__ */ new Set();
      visit2.visit(root, {
        Value(_key, node) {
          if (node.anchor)
            anchors.add(node.anchor);
        }
      });
      return anchors;
    }
    function findNewAnchor(prefix, exclude) {
      for (let i = 1; true; ++i) {
        const name = `${prefix}${i}`;
        if (!exclude.has(name))
          return name;
      }
    }
    function createNodeAnchors(doc, prefix) {
      const aliasObjects = [];
      const sourceObjects = /* @__PURE__ */ new Map();
      let prevAnchors = null;
      return {
        onAnchor: (source) => {
          aliasObjects.push(source);
          prevAnchors ?? (prevAnchors = anchorNames(doc));
          const anchor = findNewAnchor(prefix, prevAnchors);
          prevAnchors.add(anchor);
          return anchor;
        },
        /**
         * With circular references, the source node is only resolved after all
         * of its child nodes are. This is why anchors are set only after all of
         * the nodes have been created.
         */
        setAnchors: () => {
          for (const source of aliasObjects) {
            const ref = sourceObjects.get(source);
            if (typeof ref === "object" && ref.anchor && (identity.isScalar(ref.node) || identity.isCollection(ref.node))) {
              ref.node.anchor = ref.anchor;
            } else {
              const error = new Error("Failed to resolve repeated object (this should not happen)");
              error.source = source;
              throw error;
            }
          }
        },
        sourceObjects
      };
    }
    exports2.anchorIsValid = anchorIsValid;
    exports2.anchorNames = anchorNames;
    exports2.createNodeAnchors = createNodeAnchors;
    exports2.findNewAnchor = findNewAnchor;
  }
});

// node_modules/yaml/dist/doc/applyReviver.js
var require_applyReviver = __commonJS({
  "node_modules/yaml/dist/doc/applyReviver.js"(exports2) {
    "use strict";
    function applyReviver(reviver, obj, key, val) {
      if (val && typeof val === "object") {
        if (Array.isArray(val)) {
          for (let i = 0, len = val.length; i < len; ++i) {
            const v0 = val[i];
            const v1 = applyReviver(reviver, val, String(i), v0);
            if (v1 === void 0)
              delete val[i];
            else if (v1 !== v0)
              val[i] = v1;
          }
        } else if (val instanceof Map) {
          for (const k of Array.from(val.keys())) {
            const v0 = val.get(k);
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              val.delete(k);
            else if (v1 !== v0)
              val.set(k, v1);
          }
        } else if (val instanceof Set) {
          for (const v0 of Array.from(val)) {
            const v1 = applyReviver(reviver, val, v0, v0);
            if (v1 === void 0)
              val.delete(v0);
            else if (v1 !== v0) {
              val.delete(v0);
              val.add(v1);
            }
          }
        } else {
          for (const [k, v0] of Object.entries(val)) {
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              delete val[k];
            else if (v1 !== v0)
              val[k] = v1;
          }
        }
      }
      return reviver.call(obj, key, val);
    }
    exports2.applyReviver = applyReviver;
  }
});

// node_modules/yaml/dist/nodes/toJS.js
var require_toJS = __commonJS({
  "node_modules/yaml/dist/nodes/toJS.js"(exports2) {
    "use strict";
    var identity = require_identity();
    function toJS(value, arg, ctx) {
      if (Array.isArray(value))
        return value.map((v, i) => toJS(v, String(i), ctx));
      if (value && typeof value.toJSON === "function") {
        if (!ctx || !identity.hasAnchor(value))
          return value.toJSON(arg, ctx);
        const data = { aliasCount: 0, count: 1, res: void 0 };
        ctx.anchors.set(value, data);
        ctx.onCreate = (res2) => {
          data.res = res2;
          delete ctx.onCreate;
        };
        const res = value.toJSON(arg, ctx);
        if (ctx.onCreate)
          ctx.onCreate(res);
        return res;
      }
      if (typeof value === "bigint" && !ctx?.keep)
        return Number(value);
      return value;
    }
    exports2.toJS = toJS;
  }
});

// node_modules/yaml/dist/nodes/Node.js
var require_Node = __commonJS({
  "node_modules/yaml/dist/nodes/Node.js"(exports2) {
    "use strict";
    var applyReviver = require_applyReviver();
    var identity = require_identity();
    var toJS = require_toJS();
    var NodeBase = class {
      constructor(type) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: type });
      }
      /** Create a copy of this node.  */
      clone() {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** A plain JavaScript representation of this node. */
      toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        if (!identity.isDocument(doc))
          throw new TypeError("A document argument is required");
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc,
          keep: true,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this, "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
    };
    exports2.NodeBase = NodeBase;
  }
});

// node_modules/yaml/dist/nodes/Alias.js
var require_Alias = __commonJS({
  "node_modules/yaml/dist/nodes/Alias.js"(exports2) {
    "use strict";
    var anchors = require_anchors();
    var visit2 = require_visit();
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var Alias = class extends Node.NodeBase {
      constructor(source) {
        super(identity.ALIAS);
        this.source = source;
        Object.defineProperty(this, "tag", {
          set() {
            throw new Error("Alias nodes cannot have tags");
          }
        });
      }
      /**
       * Resolve the value of this alias within `doc`, finding the last
       * instance of the `source` anchor before this node.
       */
      resolve(doc, ctx) {
        let nodes;
        if (ctx?.aliasResolveCache) {
          nodes = ctx.aliasResolveCache;
        } else {
          nodes = [];
          visit2.visit(doc, {
            Node: (_key, node) => {
              if (identity.isAlias(node) || identity.hasAnchor(node))
                nodes.push(node);
            }
          });
          if (ctx)
            ctx.aliasResolveCache = nodes;
        }
        let found = void 0;
        for (const node of nodes) {
          if (node === this)
            break;
          if (node.anchor === this.source)
            found = node;
        }
        return found;
      }
      toJSON(_arg, ctx) {
        if (!ctx)
          return { source: this.source };
        const { anchors: anchors2, doc, maxAliasCount } = ctx;
        const source = this.resolve(doc, ctx);
        if (!source) {
          const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new ReferenceError(msg);
        }
        let data = anchors2.get(source);
        if (!data) {
          toJS.toJS(source, null, ctx);
          data = anchors2.get(source);
        }
        if (!data || data.res === void 0) {
          const msg = "This should not happen: Alias anchor was not resolved?";
          throw new ReferenceError(msg);
        }
        if (maxAliasCount >= 0) {
          data.count += 1;
          if (data.aliasCount === 0)
            data.aliasCount = getAliasCount(doc, source, anchors2);
          if (data.count * data.aliasCount > maxAliasCount) {
            const msg = "Excessive alias count indicates a resource exhaustion attack";
            throw new ReferenceError(msg);
          }
        }
        return data.res;
      }
      toString(ctx, _onComment, _onChompKeep) {
        const src = `*${this.source}`;
        if (ctx) {
          anchors.anchorIsValid(this.source);
          if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
            const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
            throw new Error(msg);
          }
          if (ctx.implicitKey)
            return `${src} `;
        }
        return src;
      }
    };
    function getAliasCount(doc, node, anchors2) {
      if (identity.isAlias(node)) {
        const source = node.resolve(doc);
        const anchor = anchors2 && source && anchors2.get(source);
        return anchor ? anchor.count * anchor.aliasCount : 0;
      } else if (identity.isCollection(node)) {
        let count = 0;
        for (const item of node.items) {
          const c = getAliasCount(doc, item, anchors2);
          if (c > count)
            count = c;
        }
        return count;
      } else if (identity.isPair(node)) {
        const kc = getAliasCount(doc, node.key, anchors2);
        const vc = getAliasCount(doc, node.value, anchors2);
        return Math.max(kc, vc);
      }
      return 1;
    }
    exports2.Alias = Alias;
  }
});

// node_modules/yaml/dist/nodes/Scalar.js
var require_Scalar = __commonJS({
  "node_modules/yaml/dist/nodes/Scalar.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";
    var Scalar = class extends Node.NodeBase {
      constructor(value) {
        super(identity.SCALAR);
        this.value = value;
      }
      toJSON(arg, ctx) {
        return ctx?.keep ? this.value : toJS.toJS(this.value, arg, ctx);
      }
      toString() {
        return String(this.value);
      }
    };
    Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
    Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
    Scalar.PLAIN = "PLAIN";
    Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
    Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
    exports2.Scalar = Scalar;
    exports2.isScalarValue = isScalarValue;
  }
});

// node_modules/yaml/dist/doc/createNode.js
var require_createNode = __commonJS({
  "node_modules/yaml/dist/doc/createNode.js"(exports2) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var defaultTagPrefix = "tag:yaml.org,2002:";
    function findTagObject(value, tagName, tags) {
      if (tagName) {
        const match = tags.filter((t) => t.tag === tagName);
        const tagObj = match.find((t) => !t.format) ?? match[0];
        if (!tagObj)
          throw new Error(`Tag ${tagName} not found`);
        return tagObj;
      }
      return tags.find((t) => t.identify?.(value) && !t.format);
    }
    function createNode(value, tagName, ctx) {
      if (identity.isDocument(value))
        value = value.contents;
      if (identity.isNode(value))
        return value;
      if (identity.isPair(value)) {
        const map = ctx.schema[identity.MAP].createNode?.(ctx.schema, null, ctx);
        map.items.push(value);
        return map;
      }
      if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
        value = value.valueOf();
      }
      const { aliasDuplicateObjects, onAnchor, onTagObj, schema: schema2, sourceObjects } = ctx;
      let ref = void 0;
      if (aliasDuplicateObjects && value && typeof value === "object") {
        ref = sourceObjects.get(value);
        if (ref) {
          ref.anchor ?? (ref.anchor = onAnchor(value));
          return new Alias.Alias(ref.anchor);
        } else {
          ref = { anchor: null, node: null };
          sourceObjects.set(value, ref);
        }
      }
      if (tagName?.startsWith("!!"))
        tagName = defaultTagPrefix + tagName.slice(2);
      let tagObj = findTagObject(value, tagName, schema2.tags);
      if (!tagObj) {
        if (value && typeof value.toJSON === "function") {
          value = value.toJSON();
        }
        if (!value || typeof value !== "object") {
          const node2 = new Scalar.Scalar(value);
          if (ref)
            ref.node = node2;
          return node2;
        }
        tagObj = value instanceof Map ? schema2[identity.MAP] : Symbol.iterator in Object(value) ? schema2[identity.SEQ] : schema2[identity.MAP];
      }
      if (onTagObj) {
        onTagObj(tagObj);
        delete ctx.onTagObj;
      }
      const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar.Scalar(value);
      if (tagName)
        node.tag = tagName;
      else if (!tagObj.default)
        node.tag = tagObj.tag;
      if (ref)
        ref.node = node;
      return node;
    }
    exports2.createNode = createNode;
  }
});

// node_modules/yaml/dist/nodes/Collection.js
var require_Collection = __commonJS({
  "node_modules/yaml/dist/nodes/Collection.js"(exports2) {
    "use strict";
    var createNode = require_createNode();
    var identity = require_identity();
    var Node = require_Node();
    function collectionFromPath(schema2, path20, value) {
      let v = value;
      for (let i = path20.length - 1; i >= 0; --i) {
        const k = path20[i];
        if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
          const a = [];
          a[k] = v;
          v = a;
        } else {
          v = /* @__PURE__ */ new Map([[k, v]]);
        }
      }
      return createNode.createNode(v, void 0, {
        aliasDuplicateObjects: false,
        keepUndefined: false,
        onAnchor: () => {
          throw new Error("This should not happen, please report a bug.");
        },
        schema: schema2,
        sourceObjects: /* @__PURE__ */ new Map()
      });
    }
    var isEmptyPath = (path20) => path20 == null || typeof path20 === "object" && !!path20[Symbol.iterator]().next().done;
    var Collection = class extends Node.NodeBase {
      constructor(type, schema2) {
        super(type);
        Object.defineProperty(this, "schema", {
          value: schema2,
          configurable: true,
          enumerable: false,
          writable: true
        });
      }
      /**
       * Create a copy of this collection.
       *
       * @param schema - If defined, overwrites the original's schema
       */
      clone(schema2) {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (schema2)
          copy.schema = schema2;
        copy.items = copy.items.map((it) => identity.isNode(it) || identity.isPair(it) ? it.clone(schema2) : it);
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /**
       * Adds a value to the collection. For `!!map` and `!!omap` the value must
       * be a Pair instance or a `{ key, value }` object, which may not have a key
       * that already exists in the map.
       */
      addIn(path20, value) {
        if (isEmptyPath(path20))
          this.add(value);
        else {
          const [key, ...rest] = path20;
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.addIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
      /**
       * Removes a value from the collection.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path20) {
        const [key, ...rest] = path20;
        if (rest.length === 0)
          return this.delete(key);
        const node = this.get(key, true);
        if (identity.isCollection(node))
          return node.deleteIn(rest);
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path20, keepScalar) {
        const [key, ...rest] = path20;
        const node = this.get(key, true);
        if (rest.length === 0)
          return !keepScalar && identity.isScalar(node) ? node.value : node;
        else
          return identity.isCollection(node) ? node.getIn(rest, keepScalar) : void 0;
      }
      hasAllNullValues(allowScalar) {
        return this.items.every((node) => {
          if (!identity.isPair(node))
            return false;
          const n = node.value;
          return n == null || allowScalar && identity.isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
        });
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       */
      hasIn(path20) {
        const [key, ...rest] = path20;
        if (rest.length === 0)
          return this.has(key);
        const node = this.get(key, true);
        return identity.isCollection(node) ? node.hasIn(rest) : false;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path20, value) {
        const [key, ...rest] = path20;
        if (rest.length === 0) {
          this.set(key, value);
        } else {
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.setIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
    };
    exports2.Collection = Collection;
    exports2.collectionFromPath = collectionFromPath;
    exports2.isEmptyPath = isEmptyPath;
  }
});

// node_modules/yaml/dist/stringify/stringifyComment.js
var require_stringifyComment = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyComment.js"(exports2) {
    "use strict";
    var stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
    function indentComment(comment, indent) {
      if (/^\n+$/.test(comment))
        return comment.substring(1);
      return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
    }
    var lineComment = (str, indent, comment) => str.endsWith("\n") ? indentComment(comment, indent) : comment.includes("\n") ? "\n" + indentComment(comment, indent) : (str.endsWith(" ") ? "" : " ") + comment;
    exports2.indentComment = indentComment;
    exports2.lineComment = lineComment;
    exports2.stringifyComment = stringifyComment;
  }
});

// node_modules/yaml/dist/stringify/foldFlowLines.js
var require_foldFlowLines = __commonJS({
  "node_modules/yaml/dist/stringify/foldFlowLines.js"(exports2) {
    "use strict";
    var FOLD_FLOW = "flow";
    var FOLD_BLOCK = "block";
    var FOLD_QUOTED = "quoted";
    function foldFlowLines(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
      if (!lineWidth || lineWidth < 0)
        return text;
      if (lineWidth < minContentWidth)
        minContentWidth = 0;
      const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
      if (text.length <= endStep)
        return text;
      const folds = [];
      const escapedFolds = {};
      let end = lineWidth - indent.length;
      if (typeof indentAtStart === "number") {
        if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
          folds.push(0);
        else
          end = lineWidth - indentAtStart;
      }
      let split = void 0;
      let prev = void 0;
      let overflow = false;
      let i = -1;
      let escStart = -1;
      let escEnd = -1;
      if (mode === FOLD_BLOCK) {
        i = consumeMoreIndentedLines(text, i, indent.length);
        if (i !== -1)
          end = i + endStep;
      }
      for (let ch; ch = text[i += 1]; ) {
        if (mode === FOLD_QUOTED && ch === "\\") {
          escStart = i;
          switch (text[i + 1]) {
            case "x":
              i += 3;
              break;
            case "u":
              i += 5;
              break;
            case "U":
              i += 9;
              break;
            default:
              i += 1;
          }
          escEnd = i;
        }
        if (ch === "\n") {
          if (mode === FOLD_BLOCK)
            i = consumeMoreIndentedLines(text, i, indent.length);
          end = i + indent.length + endStep;
          split = void 0;
        } else {
          if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
            const next = text[i + 1];
            if (next && next !== " " && next !== "\n" && next !== "	")
              split = i;
          }
          if (i >= end) {
            if (split) {
              folds.push(split);
              end = split + endStep;
              split = void 0;
            } else if (mode === FOLD_QUOTED) {
              while (prev === " " || prev === "	") {
                prev = ch;
                ch = text[i += 1];
                overflow = true;
              }
              const j = i > escEnd + 1 ? i - 2 : escStart - 1;
              if (escapedFolds[j])
                return text;
              folds.push(j);
              escapedFolds[j] = true;
              end = j + endStep;
              split = void 0;
            } else {
              overflow = true;
            }
          }
        }
        prev = ch;
      }
      if (overflow && onOverflow)
        onOverflow();
      if (folds.length === 0)
        return text;
      if (onFold)
        onFold();
      let res = text.slice(0, folds[0]);
      for (let i2 = 0; i2 < folds.length; ++i2) {
        const fold = folds[i2];
        const end2 = folds[i2 + 1] || text.length;
        if (fold === 0)
          res = `
${indent}${text.slice(0, end2)}`;
        else {
          if (mode === FOLD_QUOTED && escapedFolds[fold])
            res += `${text[fold]}\\`;
          res += `
${indent}${text.slice(fold + 1, end2)}`;
        }
      }
      return res;
    }
    function consumeMoreIndentedLines(text, i, indent) {
      let end = i;
      let start = i + 1;
      let ch = text[start];
      while (ch === " " || ch === "	") {
        if (i < start + indent) {
          ch = text[++i];
        } else {
          do {
            ch = text[++i];
          } while (ch && ch !== "\n");
          end = i;
          start = i + 1;
          ch = text[start];
        }
      }
      return end;
    }
    exports2.FOLD_BLOCK = FOLD_BLOCK;
    exports2.FOLD_FLOW = FOLD_FLOW;
    exports2.FOLD_QUOTED = FOLD_QUOTED;
    exports2.foldFlowLines = foldFlowLines;
  }
});

// node_modules/yaml/dist/stringify/stringifyString.js
var require_stringifyString = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyString.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var foldFlowLines = require_foldFlowLines();
    var getFoldOptions = (ctx, isBlock) => ({
      indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
      lineWidth: ctx.options.lineWidth,
      minContentWidth: ctx.options.minContentWidth
    });
    var containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
    function lineLengthOverLimit(str, lineWidth, indentLength) {
      if (!lineWidth || lineWidth < 0)
        return false;
      const limit = lineWidth - indentLength;
      const strLen = str.length;
      if (strLen <= limit)
        return false;
      for (let i = 0, start = 0; i < strLen; ++i) {
        if (str[i] === "\n") {
          if (i - start > limit)
            return true;
          start = i + 1;
          if (strLen - start <= limit)
            return false;
        }
      }
      return true;
    }
    function doubleQuotedString(value, ctx) {
      const json = JSON.stringify(value);
      if (ctx.options.doubleQuotedAsJSON)
        return json;
      const { implicitKey } = ctx;
      const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      let str = "";
      let start = 0;
      for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
        if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
          str += json.slice(start, i) + "\\ ";
          i += 1;
          start = i;
          ch = "\\";
        }
        if (ch === "\\")
          switch (json[i + 1]) {
            case "u":
              {
                str += json.slice(start, i);
                const code = json.substr(i + 2, 4);
                switch (code) {
                  case "0000":
                    str += "\\0";
                    break;
                  case "0007":
                    str += "\\a";
                    break;
                  case "000b":
                    str += "\\v";
                    break;
                  case "001b":
                    str += "\\e";
                    break;
                  case "0085":
                    str += "\\N";
                    break;
                  case "00a0":
                    str += "\\_";
                    break;
                  case "2028":
                    str += "\\L";
                    break;
                  case "2029":
                    str += "\\P";
                    break;
                  default:
                    if (code.substr(0, 2) === "00")
                      str += "\\x" + code.substr(2);
                    else
                      str += json.substr(i, 6);
                }
                i += 5;
                start = i + 1;
              }
              break;
            case "n":
              if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) {
                i += 1;
              } else {
                str += json.slice(start, i) + "\n\n";
                while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== '"') {
                  str += "\n";
                  i += 2;
                }
                str += indent;
                if (json[i + 2] === " ")
                  str += "\\";
                i += 1;
                start = i + 1;
              }
              break;
            default:
              i += 1;
          }
      }
      str = start ? str + json.slice(start) : json;
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
    }
    function singleQuotedString(value, ctx) {
      if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes("\n") || /[ \t]\n|\n[ \t]/.test(value))
        return doubleQuotedString(value, ctx);
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
      return ctx.implicitKey ? res : foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function quotedString(value, ctx) {
      const { singleQuote } = ctx.options;
      let qs;
      if (singleQuote === false)
        qs = doubleQuotedString;
      else {
        const hasDouble = value.includes('"');
        const hasSingle = value.includes("'");
        if (hasDouble && !hasSingle)
          qs = singleQuotedString;
        else if (hasSingle && !hasDouble)
          qs = doubleQuotedString;
        else
          qs = singleQuote ? singleQuotedString : doubleQuotedString;
      }
      return qs(value, ctx);
    }
    var blockEndNewlines;
    try {
      blockEndNewlines = new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
    } catch {
      blockEndNewlines = /\n+(?!\n|$)/g;
    }
    function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
      const { blockQuote, commentString, lineWidth } = ctx.options;
      if (!blockQuote || /\n[\t ]+$/.test(value)) {
        return quotedString(value, ctx);
      }
      const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
      const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.Scalar.BLOCK_FOLDED ? false : type === Scalar.Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
      if (!value)
        return literal ? "|\n" : ">\n";
      let chomp;
      let endStart;
      for (endStart = value.length; endStart > 0; --endStart) {
        const ch = value[endStart - 1];
        if (ch !== "\n" && ch !== "	" && ch !== " ")
          break;
      }
      let end = value.substring(endStart);
      const endNlPos = end.indexOf("\n");
      if (endNlPos === -1) {
        chomp = "-";
      } else if (value === end || endNlPos !== end.length - 1) {
        chomp = "+";
        if (onChompKeep)
          onChompKeep();
      } else {
        chomp = "";
      }
      if (end) {
        value = value.slice(0, -end.length);
        if (end[end.length - 1] === "\n")
          end = end.slice(0, -1);
        end = end.replace(blockEndNewlines, `$&${indent}`);
      }
      let startWithSpace = false;
      let startEnd;
      let startNlPos = -1;
      for (startEnd = 0; startEnd < value.length; ++startEnd) {
        const ch = value[startEnd];
        if (ch === " ")
          startWithSpace = true;
        else if (ch === "\n")
          startNlPos = startEnd;
        else
          break;
      }
      let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
      if (start) {
        value = value.substring(start.length);
        start = start.replace(/\n+/g, `$&${indent}`);
      }
      const indentSize = indent ? "2" : "1";
      let header = (startWithSpace ? indentSize : "") + chomp;
      if (comment) {
        header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
        if (onComment)
          onComment();
      }
      if (!literal) {
        const foldedValue = value.replace(/\n+/g, "\n$&").replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
        let literalFallback = false;
        const foldOptions = getFoldOptions(ctx, true);
        if (blockQuote !== "folded" && type !== Scalar.Scalar.BLOCK_FOLDED) {
          foldOptions.onOverflow = () => {
            literalFallback = true;
          };
        }
        const body = foldFlowLines.foldFlowLines(`${start}${foldedValue}${end}`, indent, foldFlowLines.FOLD_BLOCK, foldOptions);
        if (!literalFallback)
          return `>${header}
${indent}${body}`;
      }
      value = value.replace(/\n+/g, `$&${indent}`);
      return `|${header}
${indent}${start}${value}${end}`;
    }
    function plainString(item, ctx, onComment, onChompKeep) {
      const { type, value } = item;
      const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
      if (implicitKey && value.includes("\n") || inFlow && /[[\]{},]/.test(value)) {
        return quotedString(value, ctx);
      }
      if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
        return implicitKey || inFlow || !value.includes("\n") ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
      }
      if (!implicitKey && !inFlow && type !== Scalar.Scalar.PLAIN && value.includes("\n")) {
        return blockString(item, ctx, onComment, onChompKeep);
      }
      if (containsDocumentMarker(value)) {
        if (indent === "") {
          ctx.forceBlockIndent = true;
          return blockString(item, ctx, onComment, onChompKeep);
        } else if (implicitKey && indent === indentStep) {
          return quotedString(value, ctx);
        }
      }
      const str = value.replace(/\n+/g, `$&
${indent}`);
      if (actualString) {
        const test7 = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str);
        const { compat, tags } = ctx.doc.schema;
        if (tags.some(test7) || compat?.some(test7))
          return quotedString(value, ctx);
      }
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function stringifyString(item, ctx, onComment, onChompKeep) {
      const { implicitKey, inFlow } = ctx;
      const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
      let { type } = item;
      if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
        if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
          type = Scalar.Scalar.QUOTE_DOUBLE;
      }
      const _stringify = (_type) => {
        switch (_type) {
          case Scalar.Scalar.BLOCK_FOLDED:
          case Scalar.Scalar.BLOCK_LITERAL:
            return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
          case Scalar.Scalar.QUOTE_DOUBLE:
            return doubleQuotedString(ss.value, ctx);
          case Scalar.Scalar.QUOTE_SINGLE:
            return singleQuotedString(ss.value, ctx);
          case Scalar.Scalar.PLAIN:
            return plainString(ss, ctx, onComment, onChompKeep);
          default:
            return null;
        }
      };
      let res = _stringify(type);
      if (res === null) {
        const { defaultKeyType, defaultStringType } = ctx.options;
        const t = implicitKey && defaultKeyType || defaultStringType;
        res = _stringify(t);
        if (res === null)
          throw new Error(`Unsupported default string type ${t}`);
      }
      return res;
    }
    exports2.stringifyString = stringifyString;
  }
});

// node_modules/yaml/dist/stringify/stringify.js
var require_stringify = __commonJS({
  "node_modules/yaml/dist/stringify/stringify.js"(exports2) {
    "use strict";
    var anchors = require_anchors();
    var identity = require_identity();
    var stringifyComment = require_stringifyComment();
    var stringifyString = require_stringifyString();
    function createStringifyContext(doc, options) {
      const opt = Object.assign({
        blockQuote: true,
        commentString: stringifyComment.stringifyComment,
        defaultKeyType: null,
        defaultStringType: "PLAIN",
        directives: null,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        falseStr: "false",
        flowCollectionPadding: true,
        indentSeq: true,
        lineWidth: 80,
        minContentWidth: 20,
        nullStr: "null",
        simpleKeys: false,
        singleQuote: null,
        trueStr: "true",
        verifyAliasOrder: true
      }, doc.schema.toStringOptions, options);
      let inFlow;
      switch (opt.collectionStyle) {
        case "block":
          inFlow = false;
          break;
        case "flow":
          inFlow = true;
          break;
        default:
          inFlow = null;
      }
      return {
        anchors: /* @__PURE__ */ new Set(),
        doc,
        flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
        indent: "",
        indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
        inFlow,
        options: opt
      };
    }
    function getTagObject(tags, item) {
      if (item.tag) {
        const match = tags.filter((t) => t.tag === item.tag);
        if (match.length > 0)
          return match.find((t) => t.format === item.format) ?? match[0];
      }
      let tagObj = void 0;
      let obj;
      if (identity.isScalar(item)) {
        obj = item.value;
        let match = tags.filter((t) => t.identify?.(obj));
        if (match.length > 1) {
          const testMatch = match.filter((t) => t.test);
          if (testMatch.length > 0)
            match = testMatch;
        }
        tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
      } else {
        obj = item;
        tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
      }
      if (!tagObj) {
        const name = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
        throw new Error(`Tag not resolved for ${name} value`);
      }
      return tagObj;
    }
    function stringifyProps(node, tagObj, { anchors: anchors$1, doc }) {
      if (!doc.directives)
        return "";
      const props = [];
      const anchor = (identity.isScalar(node) || identity.isCollection(node)) && node.anchor;
      if (anchor && anchors.anchorIsValid(anchor)) {
        anchors$1.add(anchor);
        props.push(`&${anchor}`);
      }
      const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
      if (tag)
        props.push(doc.directives.tagString(tag));
      return props.join(" ");
    }
    function stringify(item, ctx, onComment, onChompKeep) {
      if (identity.isPair(item))
        return item.toString(ctx, onComment, onChompKeep);
      if (identity.isAlias(item)) {
        if (ctx.doc.directives)
          return item.toString(ctx);
        if (ctx.resolvedAliases?.has(item)) {
          throw new TypeError(`Cannot stringify circular structure without alias nodes`);
        } else {
          if (ctx.resolvedAliases)
            ctx.resolvedAliases.add(item);
          else
            ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
          item = item.resolve(ctx.doc);
        }
      }
      let tagObj = void 0;
      const node = identity.isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
      tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
      const props = stringifyProps(node, tagObj, ctx);
      if (props.length > 0)
        ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
      const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : identity.isScalar(node) ? stringifyString.stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
      if (!props)
        return str;
      return identity.isScalar(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}
${ctx.indent}${str}`;
    }
    exports2.createStringifyContext = createStringifyContext;
    exports2.stringify = stringify;
  }
});

// node_modules/yaml/dist/stringify/stringifyPair.js
var require_stringifyPair = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyPair.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
      const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
      let keyComment = identity.isNode(key) && key.comment || null;
      if (simpleKeys) {
        if (keyComment) {
          throw new Error("With simple keys, key nodes cannot have comments");
        }
        if (identity.isCollection(key) || !identity.isNode(key) && typeof key === "object") {
          const msg = "With simple keys, collection cannot be used as a key value";
          throw new Error(msg);
        }
      }
      let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || identity.isCollection(key) || (identity.isScalar(key) ? key.type === Scalar.Scalar.BLOCK_FOLDED || key.type === Scalar.Scalar.BLOCK_LITERAL : typeof key === "object"));
      ctx = Object.assign({}, ctx, {
        allNullValues: false,
        implicitKey: !explicitKey && (simpleKeys || !allNullValues),
        indent: indent + indentStep
      });
      let keyCommentDone = false;
      let chompKeep = false;
      let str = stringify.stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
      if (!explicitKey && !ctx.inFlow && str.length > 1024) {
        if (simpleKeys)
          throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
        explicitKey = true;
      }
      if (ctx.inFlow) {
        if (allNullValues || value == null) {
          if (keyCommentDone && onComment)
            onComment();
          return str === "" ? "?" : explicitKey ? `? ${str}` : str;
        }
      } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
        str = `? ${str}`;
        if (keyComment && !keyCommentDone) {
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        } else if (chompKeep && onChompKeep)
          onChompKeep();
        return str;
      }
      if (keyCommentDone)
        keyComment = null;
      if (explicitKey) {
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        str = `? ${str}
${indent}:`;
      } else {
        str = `${str}:`;
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
      }
      let vsb, vcb, valueComment;
      if (identity.isNode(value)) {
        vsb = !!value.spaceBefore;
        vcb = value.commentBefore;
        valueComment = value.comment;
      } else {
        vsb = false;
        vcb = null;
        valueComment = null;
        if (value && typeof value === "object")
          value = doc.createNode(value);
      }
      ctx.implicitKey = false;
      if (!explicitKey && !keyComment && identity.isScalar(value))
        ctx.indentAtStart = str.length + 1;
      chompKeep = false;
      if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && identity.isSeq(value) && !value.flow && !value.tag && !value.anchor) {
        ctx.indent = ctx.indent.substring(2);
      }
      let valueCommentDone = false;
      const valueStr = stringify.stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
      let ws = " ";
      if (keyComment || vsb || vcb) {
        ws = vsb ? "\n" : "";
        if (vcb) {
          const cs = commentString(vcb);
          ws += `
${stringifyComment.indentComment(cs, ctx.indent)}`;
        }
        if (valueStr === "" && !ctx.inFlow) {
          if (ws === "\n")
            ws = "\n\n";
        } else {
          ws += `
${ctx.indent}`;
        }
      } else if (!explicitKey && identity.isCollection(value)) {
        const vs0 = valueStr[0];
        const nl0 = valueStr.indexOf("\n");
        const hasNewline = nl0 !== -1;
        const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
        if (hasNewline || !flow) {
          let hasPropsLine = false;
          if (hasNewline && (vs0 === "&" || vs0 === "!")) {
            let sp0 = valueStr.indexOf(" ");
            if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
              sp0 = valueStr.indexOf(" ", sp0 + 1);
            }
            if (sp0 === -1 || nl0 < sp0)
              hasPropsLine = true;
          }
          if (!hasPropsLine)
            ws = `
${ctx.indent}`;
        }
      } else if (valueStr === "" || valueStr[0] === "\n") {
        ws = "";
      }
      str += ws + valueStr;
      if (ctx.inFlow) {
        if (valueCommentDone && onComment)
          onComment();
      } else if (valueComment && !valueCommentDone) {
        str += stringifyComment.lineComment(str, ctx.indent, commentString(valueComment));
      } else if (chompKeep && onChompKeep) {
        onChompKeep();
      }
      return str;
    }
    exports2.stringifyPair = stringifyPair;
  }
});

// node_modules/yaml/dist/log.js
var require_log = __commonJS({
  "node_modules/yaml/dist/log.js"(exports2) {
    "use strict";
    var node_process = require("process");
    function debug(logLevel, ...messages) {
      if (logLevel === "debug")
        console.log(...messages);
    }
    function warn(logLevel, warning) {
      if (logLevel === "debug" || logLevel === "warn") {
        if (typeof node_process.emitWarning === "function")
          node_process.emitWarning(warning);
        else
          console.warn(warning);
      }
    }
    exports2.debug = debug;
    exports2.warn = warn;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/merge.js
var require_merge = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/merge.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var MERGE_KEY = "<<";
    var merge = {
      identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
      default: "key",
      tag: "tag:yaml.org,2002:merge",
      test: /^<<$/,
      resolve: () => Object.assign(new Scalar.Scalar(Symbol(MERGE_KEY)), {
        addToJSMap: addMergeToJSMap
      }),
      stringify: () => MERGE_KEY
    };
    var isMergeKey = (ctx, key) => (merge.identify(key) || identity.isScalar(key) && (!key.type || key.type === Scalar.Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
    function addMergeToJSMap(ctx, map, value) {
      value = ctx && identity.isAlias(value) ? value.resolve(ctx.doc) : value;
      if (identity.isSeq(value))
        for (const it of value.items)
          mergeValue(ctx, map, it);
      else if (Array.isArray(value))
        for (const it of value)
          mergeValue(ctx, map, it);
      else
        mergeValue(ctx, map, value);
    }
    function mergeValue(ctx, map, value) {
      const source = ctx && identity.isAlias(value) ? value.resolve(ctx.doc) : value;
      if (!identity.isMap(source))
        throw new Error("Merge sources must be maps or map aliases");
      const srcMap = source.toJSON(null, ctx, Map);
      for (const [key, value2] of srcMap) {
        if (map instanceof Map) {
          if (!map.has(key))
            map.set(key, value2);
        } else if (map instanceof Set) {
          map.add(key);
        } else if (!Object.prototype.hasOwnProperty.call(map, key)) {
          Object.defineProperty(map, key, {
            value: value2,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
      return map;
    }
    exports2.addMergeToJSMap = addMergeToJSMap;
    exports2.isMergeKey = isMergeKey;
    exports2.merge = merge;
  }
});

// node_modules/yaml/dist/nodes/addPairToJSMap.js
var require_addPairToJSMap = __commonJS({
  "node_modules/yaml/dist/nodes/addPairToJSMap.js"(exports2) {
    "use strict";
    var log = require_log();
    var merge = require_merge();
    var stringify = require_stringify();
    var identity = require_identity();
    var toJS = require_toJS();
    function addPairToJSMap(ctx, map, { key, value }) {
      if (identity.isNode(key) && key.addToJSMap)
        key.addToJSMap(ctx, map, value);
      else if (merge.isMergeKey(ctx, key))
        merge.addMergeToJSMap(ctx, map, value);
      else {
        const jsKey = toJS.toJS(key, "", ctx);
        if (map instanceof Map) {
          map.set(jsKey, toJS.toJS(value, jsKey, ctx));
        } else if (map instanceof Set) {
          map.add(jsKey);
        } else {
          const stringKey = stringifyKey(key, jsKey, ctx);
          const jsValue = toJS.toJS(value, stringKey, ctx);
          if (stringKey in map)
            Object.defineProperty(map, stringKey, {
              value: jsValue,
              writable: true,
              enumerable: true,
              configurable: true
            });
          else
            map[stringKey] = jsValue;
        }
      }
      return map;
    }
    function stringifyKey(key, jsKey, ctx) {
      if (jsKey === null)
        return "";
      if (typeof jsKey !== "object")
        return String(jsKey);
      if (identity.isNode(key) && ctx?.doc) {
        const strCtx = stringify.createStringifyContext(ctx.doc, {});
        strCtx.anchors = /* @__PURE__ */ new Set();
        for (const node of ctx.anchors.keys())
          strCtx.anchors.add(node.anchor);
        strCtx.inFlow = true;
        strCtx.inStringifyKey = true;
        const strKey = key.toString(strCtx);
        if (!ctx.mapKeyWarned) {
          let jsonStr = JSON.stringify(strKey);
          if (jsonStr.length > 40)
            jsonStr = jsonStr.substring(0, 36) + '..."';
          log.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
          ctx.mapKeyWarned = true;
        }
        return strKey;
      }
      return JSON.stringify(jsKey);
    }
    exports2.addPairToJSMap = addPairToJSMap;
  }
});

// node_modules/yaml/dist/nodes/Pair.js
var require_Pair = __commonJS({
  "node_modules/yaml/dist/nodes/Pair.js"(exports2) {
    "use strict";
    var createNode = require_createNode();
    var stringifyPair = require_stringifyPair();
    var addPairToJSMap = require_addPairToJSMap();
    var identity = require_identity();
    function createPair(key, value, ctx) {
      const k = createNode.createNode(key, void 0, ctx);
      const v = createNode.createNode(value, void 0, ctx);
      return new Pair(k, v);
    }
    var Pair = class _Pair {
      constructor(key, value = null) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.PAIR });
        this.key = key;
        this.value = value;
      }
      clone(schema2) {
        let { key, value } = this;
        if (identity.isNode(key))
          key = key.clone(schema2);
        if (identity.isNode(value))
          value = value.clone(schema2);
        return new _Pair(key, value);
      }
      toJSON(_, ctx) {
        const pair = ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        return addPairToJSMap.addPairToJSMap(ctx, pair, this);
      }
      toString(ctx, onComment, onChompKeep) {
        return ctx?.doc ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
      }
    };
    exports2.Pair = Pair;
    exports2.createPair = createPair;
  }
});

// node_modules/yaml/dist/stringify/stringifyCollection.js
var require_stringifyCollection = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyCollection.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyCollection(collection, ctx, options) {
      const flow = ctx.inFlow ?? collection.flow;
      const stringify2 = flow ? stringifyFlowCollection : stringifyBlockCollection;
      return stringify2(collection, ctx, options);
    }
    function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
      const { indent, options: { commentString } } = ctx;
      const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
      let chompKeep = false;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment2 = null;
        if (identity.isNode(item)) {
          if (!chompKeep && item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
          if (item.comment)
            comment2 = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (!chompKeep && ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
          }
        }
        chompKeep = false;
        let str2 = stringify.stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
        if (comment2)
          str2 += stringifyComment.lineComment(str2, itemIndent, commentString(comment2));
        if (chompKeep && comment2)
          chompKeep = false;
        lines.push(blockItemPrefix + str2);
      }
      let str;
      if (lines.length === 0) {
        str = flowChars.start + flowChars.end;
      } else {
        str = lines[0];
        for (let i = 1; i < lines.length; ++i) {
          const line = lines[i];
          str += line ? `
${indent}${line}` : "\n";
        }
      }
      if (comment) {
        str += "\n" + stringifyComment.indentComment(commentString(comment), indent);
        if (onComment)
          onComment();
      } else if (chompKeep && onChompKeep)
        onChompKeep();
      return str;
    }
    function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
      const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
      itemIndent += indentStep;
      const itemCtx = Object.assign({}, ctx, {
        indent: itemIndent,
        inFlow: true,
        type: null
      });
      let reqNewline = false;
      let linesAtValue = 0;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if (identity.isNode(item)) {
          if (item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, false);
          if (item.comment)
            comment = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, false);
            if (ik.comment)
              reqNewline = true;
          }
          const iv = identity.isNode(item.value) ? item.value : null;
          if (iv) {
            if (iv.comment)
              comment = iv.comment;
            if (iv.commentBefore)
              reqNewline = true;
          } else if (item.value == null && ik?.comment) {
            comment = ik.comment;
          }
        }
        if (comment)
          reqNewline = true;
        let str = stringify.stringify(item, itemCtx, () => comment = null);
        if (i < items.length - 1)
          str += ",";
        if (comment)
          str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
        if (!reqNewline && (lines.length > linesAtValue || str.includes("\n")))
          reqNewline = true;
        lines.push(str);
        linesAtValue = lines.length;
      }
      const { start, end } = flowChars;
      if (lines.length === 0) {
        return start + end;
      } else {
        if (!reqNewline) {
          const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
          reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
        }
        if (reqNewline) {
          let str = start;
          for (const line of lines)
            str += line ? `
${indentStep}${indent}${line}` : "\n";
          return `${str}
${indent}${end}`;
        } else {
          return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
        }
      }
    }
    function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
      if (comment && chompKeep)
        comment = comment.replace(/^\n+/, "");
      if (comment) {
        const ic = stringifyComment.indentComment(commentString(comment), indent);
        lines.push(ic.trimStart());
      }
    }
    exports2.stringifyCollection = stringifyCollection;
  }
});

// node_modules/yaml/dist/nodes/YAMLMap.js
var require_YAMLMap = __commonJS({
  "node_modules/yaml/dist/nodes/YAMLMap.js"(exports2) {
    "use strict";
    var stringifyCollection = require_stringifyCollection();
    var addPairToJSMap = require_addPairToJSMap();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    function findPair(items, key) {
      const k = identity.isScalar(key) ? key.value : key;
      for (const it of items) {
        if (identity.isPair(it)) {
          if (it.key === key || it.key === k)
            return it;
          if (identity.isScalar(it.key) && it.key.value === k)
            return it;
        }
      }
      return void 0;
    }
    var YAMLMap = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:map";
      }
      constructor(schema2) {
        super(identity.MAP, schema2);
        this.items = [];
      }
      /**
       * A generic collection parsing method that can be extended
       * to other node classes that inherit from YAMLMap
       */
      static from(schema2, obj, ctx) {
        const { keepUndefined, replacer } = ctx;
        const map = new this(schema2);
        const add = (key, value) => {
          if (typeof replacer === "function")
            value = replacer.call(obj, key, value);
          else if (Array.isArray(replacer) && !replacer.includes(key))
            return;
          if (value !== void 0 || keepUndefined)
            map.items.push(Pair.createPair(key, value, ctx));
        };
        if (obj instanceof Map) {
          for (const [key, value] of obj)
            add(key, value);
        } else if (obj && typeof obj === "object") {
          for (const key of Object.keys(obj))
            add(key, obj[key]);
        }
        if (typeof schema2.sortMapEntries === "function") {
          map.items.sort(schema2.sortMapEntries);
        }
        return map;
      }
      /**
       * Adds a value to the collection.
       *
       * @param overwrite - If not set `true`, using a key that is already in the
       *   collection will throw. Otherwise, overwrites the previous value.
       */
      add(pair, overwrite) {
        let _pair;
        if (identity.isPair(pair))
          _pair = pair;
        else if (!pair || typeof pair !== "object" || !("key" in pair)) {
          _pair = new Pair.Pair(pair, pair?.value);
        } else
          _pair = new Pair.Pair(pair.key, pair.value);
        const prev = findPair(this.items, _pair.key);
        const sortEntries = this.schema?.sortMapEntries;
        if (prev) {
          if (!overwrite)
            throw new Error(`Key ${_pair.key} already set`);
          if (identity.isScalar(prev.value) && Scalar.isScalarValue(_pair.value))
            prev.value.value = _pair.value;
          else
            prev.value = _pair.value;
        } else if (sortEntries) {
          const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
          if (i === -1)
            this.items.push(_pair);
          else
            this.items.splice(i, 0, _pair);
        } else {
          this.items.push(_pair);
        }
      }
      delete(key) {
        const it = findPair(this.items, key);
        if (!it)
          return false;
        const del = this.items.splice(this.items.indexOf(it), 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const it = findPair(this.items, key);
        const node = it?.value;
        return (!keepScalar && identity.isScalar(node) ? node.value : node) ?? void 0;
      }
      has(key) {
        return !!findPair(this.items, key);
      }
      set(key, value) {
        this.add(new Pair.Pair(key, value), true);
      }
      /**
       * @param ctx - Conversion context, originally set in Document#toJS()
       * @param {Class} Type - If set, forces the returned collection type
       * @returns Instance of Type, Map, or Object
       */
      toJSON(_, ctx, Type) {
        const map = Type ? new Type() : ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const item of this.items)
          addPairToJSMap.addPairToJSMap(ctx, map, item);
        return map;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        for (const item of this.items) {
          if (!identity.isPair(item))
            throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
        }
        if (!ctx.allNullValues && this.hasAllNullValues(false))
          ctx = Object.assign({}, ctx, { allNullValues: true });
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "",
          flowChars: { start: "{", end: "}" },
          itemIndent: ctx.indent || "",
          onChompKeep,
          onComment
        });
      }
    };
    exports2.YAMLMap = YAMLMap;
    exports2.findPair = findPair;
  }
});

// node_modules/yaml/dist/schema/common/map.js
var require_map = __commonJS({
  "node_modules/yaml/dist/schema/common/map.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var YAMLMap = require_YAMLMap();
    var map = {
      collection: "map",
      default: true,
      nodeClass: YAMLMap.YAMLMap,
      tag: "tag:yaml.org,2002:map",
      resolve(map2, onError) {
        if (!identity.isMap(map2))
          onError("Expected a mapping for this tag");
        return map2;
      },
      createNode: (schema2, obj, ctx) => YAMLMap.YAMLMap.from(schema2, obj, ctx)
    };
    exports2.map = map;
  }
});

// node_modules/yaml/dist/nodes/YAMLSeq.js
var require_YAMLSeq = __commonJS({
  "node_modules/yaml/dist/nodes/YAMLSeq.js"(exports2) {
    "use strict";
    var createNode = require_createNode();
    var stringifyCollection = require_stringifyCollection();
    var Collection = require_Collection();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var toJS = require_toJS();
    var YAMLSeq = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:seq";
      }
      constructor(schema2) {
        super(identity.SEQ, schema2);
        this.items = [];
      }
      add(value) {
        this.items.push(value);
      }
      /**
       * Removes a value from the collection.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       *
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return false;
        const del = this.items.splice(idx, 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return void 0;
        const it = this.items[idx];
        return !keepScalar && identity.isScalar(it) ? it.value : it;
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       */
      has(key) {
        const idx = asItemIndex(key);
        return typeof idx === "number" && idx < this.items.length;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       *
       * If `key` does not contain a representation of an integer, this will throw.
       * It may be wrapped in a `Scalar`.
       */
      set(key, value) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          throw new Error(`Expected a valid index, not ${key}.`);
        const prev = this.items[idx];
        if (identity.isScalar(prev) && Scalar.isScalarValue(value))
          prev.value = value;
        else
          this.items[idx] = value;
      }
      toJSON(_, ctx) {
        const seq = [];
        if (ctx?.onCreate)
          ctx.onCreate(seq);
        let i = 0;
        for (const item of this.items)
          seq.push(toJS.toJS(item, String(i++), ctx));
        return seq;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "- ",
          flowChars: { start: "[", end: "]" },
          itemIndent: (ctx.indent || "") + "  ",
          onChompKeep,
          onComment
        });
      }
      static from(schema2, obj, ctx) {
        const { replacer } = ctx;
        const seq = new this(schema2);
        if (obj && Symbol.iterator in Object(obj)) {
          let i = 0;
          for (let it of obj) {
            if (typeof replacer === "function") {
              const key = obj instanceof Set ? it : String(i++);
              it = replacer.call(obj, key, it);
            }
            seq.items.push(createNode.createNode(it, void 0, ctx));
          }
        }
        return seq;
      }
    };
    function asItemIndex(key) {
      let idx = identity.isScalar(key) ? key.value : key;
      if (idx && typeof idx === "string")
        idx = Number(idx);
      return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
    }
    exports2.YAMLSeq = YAMLSeq;
  }
});

// node_modules/yaml/dist/schema/common/seq.js
var require_seq = __commonJS({
  "node_modules/yaml/dist/schema/common/seq.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var YAMLSeq = require_YAMLSeq();
    var seq = {
      collection: "seq",
      default: true,
      nodeClass: YAMLSeq.YAMLSeq,
      tag: "tag:yaml.org,2002:seq",
      resolve(seq2, onError) {
        if (!identity.isSeq(seq2))
          onError("Expected a sequence for this tag");
        return seq2;
      },
      createNode: (schema2, obj, ctx) => YAMLSeq.YAMLSeq.from(schema2, obj, ctx)
    };
    exports2.seq = seq;
  }
});

// node_modules/yaml/dist/schema/common/string.js
var require_string = __commonJS({
  "node_modules/yaml/dist/schema/common/string.js"(exports2) {
    "use strict";
    var stringifyString = require_stringifyString();
    var string = {
      identify: (value) => typeof value === "string",
      default: true,
      tag: "tag:yaml.org,2002:str",
      resolve: (str) => str,
      stringify(item, ctx, onComment, onChompKeep) {
        ctx = Object.assign({ actualString: true }, ctx);
        return stringifyString.stringifyString(item, ctx, onComment, onChompKeep);
      }
    };
    exports2.string = string;
  }
});

// node_modules/yaml/dist/schema/common/null.js
var require_null = __commonJS({
  "node_modules/yaml/dist/schema/common/null.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var nullTag = {
      identify: (value) => value == null,
      createNode: () => new Scalar.Scalar(null),
      default: true,
      tag: "tag:yaml.org,2002:null",
      test: /^(?:~|[Nn]ull|NULL)?$/,
      resolve: () => new Scalar.Scalar(null),
      stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
    };
    exports2.nullTag = nullTag;
  }
});

// node_modules/yaml/dist/schema/core/bool.js
var require_bool = __commonJS({
  "node_modules/yaml/dist/schema/core/bool.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var boolTag = {
      identify: (value) => typeof value === "boolean",
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
      resolve: (str) => new Scalar.Scalar(str[0] === "t" || str[0] === "T"),
      stringify({ source, value }, ctx) {
        if (source && boolTag.test.test(source)) {
          const sv = source[0] === "t" || source[0] === "T";
          if (value === sv)
            return source;
        }
        return value ? ctx.options.trueStr : ctx.options.falseStr;
      }
    };
    exports2.boolTag = boolTag;
  }
});

// node_modules/yaml/dist/stringify/stringifyNumber.js
var require_stringifyNumber = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyNumber.js"(exports2) {
    "use strict";
    function stringifyNumber({ format: format2, minFractionDigits, tag, value }) {
      if (typeof value === "bigint")
        return String(value);
      const num = typeof value === "number" ? value : Number(value);
      if (!isFinite(num))
        return isNaN(num) ? ".nan" : num < 0 ? "-.inf" : ".inf";
      let n = JSON.stringify(value);
      if (!format2 && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^\d/.test(n)) {
        let i = n.indexOf(".");
        if (i < 0) {
          i = n.length;
          n += ".";
        }
        let d = minFractionDigits - (n.length - i - 1);
        while (d-- > 0)
          n += "0";
      }
      return n;
    }
    exports2.stringifyNumber = stringifyNumber;
  }
});

// node_modules/yaml/dist/schema/core/float.js
var require_float = __commonJS({
  "node_modules/yaml/dist/schema/core/float.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str),
      stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str));
        const dot = str.indexOf(".");
        if (dot !== -1 && str[str.length - 1] === "0")
          node.minFractionDigits = str.length - dot - 1;
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports2.float = float;
    exports2.floatExp = floatExp;
    exports2.floatNaN = floatNaN;
  }
});

// node_modules/yaml/dist/schema/core/int.js
var require_int = __commonJS({
  "node_modules/yaml/dist/schema/core/int.js"(exports2) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    var intResolve = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value) && value >= 0)
        return prefix + value.toString(radix);
      return stringifyNumber.stringifyNumber(node);
    }
    var intOct = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^0o[0-7]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
      stringify: (node) => intStringify(node, 8, "0o")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^0x[0-9a-fA-F]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports2.int = int;
    exports2.intHex = intHex;
    exports2.intOct = intOct;
  }
});

// node_modules/yaml/dist/schema/core/schema.js
var require_schema = __commonJS({
  "node_modules/yaml/dist/schema/core/schema.js"(exports2) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema2 = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.boolTag,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float
    ];
    exports2.schema = schema2;
  }
});

// node_modules/yaml/dist/schema/json/schema.js
var require_schema2 = __commonJS({
  "node_modules/yaml/dist/schema/json/schema.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var map = require_map();
    var seq = require_seq();
    function intIdentify(value) {
      return typeof value === "bigint" || Number.isInteger(value);
    }
    var stringifyJSON = ({ value }) => JSON.stringify(value);
    var jsonScalars = [
      {
        identify: (value) => typeof value === "string",
        default: true,
        tag: "tag:yaml.org,2002:str",
        resolve: (str) => str,
        stringify: stringifyJSON
      },
      {
        identify: (value) => value == null,
        createNode: () => new Scalar.Scalar(null),
        default: true,
        tag: "tag:yaml.org,2002:null",
        test: /^null$/,
        resolve: () => null,
        stringify: stringifyJSON
      },
      {
        identify: (value) => typeof value === "boolean",
        default: true,
        tag: "tag:yaml.org,2002:bool",
        test: /^true$|^false$/,
        resolve: (str) => str === "true",
        stringify: stringifyJSON
      },
      {
        identify: intIdentify,
        default: true,
        tag: "tag:yaml.org,2002:int",
        test: /^-?(?:0|[1-9][0-9]*)$/,
        resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
        stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
      },
      {
        identify: (value) => typeof value === "number",
        default: true,
        tag: "tag:yaml.org,2002:float",
        test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
        resolve: (str) => parseFloat(str),
        stringify: stringifyJSON
      }
    ];
    var jsonError = {
      default: true,
      tag: "",
      test: /^/,
      resolve(str, onError) {
        onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
        return str;
      }
    };
    var schema2 = [map.map, seq.seq].concat(jsonScalars, jsonError);
    exports2.schema = schema2;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/binary.js
var require_binary = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/binary.js"(exports2) {
    "use strict";
    var node_buffer = require("buffer");
    var Scalar = require_Scalar();
    var stringifyString = require_stringifyString();
    var binary = {
      identify: (value) => value instanceof Uint8Array,
      // Buffer inherits from Uint8Array
      default: false,
      tag: "tag:yaml.org,2002:binary",
      /**
       * Returns a Buffer in node and an Uint8Array in browsers
       *
       * To use the resulting buffer as an image, you'll want to do something like:
       *
       *   const blob = new Blob([buffer], { type: 'image/jpeg' })
       *   document.querySelector('#photo').src = URL.createObjectURL(blob)
       */
      resolve(src, onError) {
        if (typeof node_buffer.Buffer === "function") {
          return node_buffer.Buffer.from(src, "base64");
        } else if (typeof atob === "function") {
          const str = atob(src.replace(/[\n\r]/g, ""));
          const buffer = new Uint8Array(str.length);
          for (let i = 0; i < str.length; ++i)
            buffer[i] = str.charCodeAt(i);
          return buffer;
        } else {
          onError("This environment does not support reading binary tags; either Buffer or atob is required");
          return src;
        }
      },
      stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
        if (!value)
          return "";
        const buf = value;
        let str;
        if (typeof node_buffer.Buffer === "function") {
          str = buf instanceof node_buffer.Buffer ? buf.toString("base64") : node_buffer.Buffer.from(buf.buffer).toString("base64");
        } else if (typeof btoa === "function") {
          let s = "";
          for (let i = 0; i < buf.length; ++i)
            s += String.fromCharCode(buf[i]);
          str = btoa(s);
        } else {
          throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
        }
        type ?? (type = Scalar.Scalar.BLOCK_LITERAL);
        if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
          const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
          const n = Math.ceil(str.length / lineWidth);
          const lines = new Array(n);
          for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
            lines[i] = str.substr(o, lineWidth);
          }
          str = lines.join(type === Scalar.Scalar.BLOCK_LITERAL ? "\n" : " ");
        }
        return stringifyString.stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
      }
    };
    exports2.binary = binary;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/pairs.js
var require_pairs = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/pairs.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLSeq = require_YAMLSeq();
    function resolvePairs(seq, onError) {
      if (identity.isSeq(seq)) {
        for (let i = 0; i < seq.items.length; ++i) {
          let item = seq.items[i];
          if (identity.isPair(item))
            continue;
          else if (identity.isMap(item)) {
            if (item.items.length > 1)
              onError("Each pair must have its own sequence indicator");
            const pair = item.items[0] || new Pair.Pair(new Scalar.Scalar(null));
            if (item.commentBefore)
              pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
            if (item.comment) {
              const cn = pair.value ?? pair.key;
              cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
            }
            item = pair;
          }
          seq.items[i] = identity.isPair(item) ? item : new Pair.Pair(item);
        }
      } else
        onError("Expected a sequence for this tag");
      return seq;
    }
    function createPairs(schema2, iterable, ctx) {
      const { replacer } = ctx;
      const pairs2 = new YAMLSeq.YAMLSeq(schema2);
      pairs2.tag = "tag:yaml.org,2002:pairs";
      let i = 0;
      if (iterable && Symbol.iterator in Object(iterable))
        for (let it of iterable) {
          if (typeof replacer === "function")
            it = replacer.call(iterable, String(i++), it);
          let key, value;
          if (Array.isArray(it)) {
            if (it.length === 2) {
              key = it[0];
              value = it[1];
            } else
              throw new TypeError(`Expected [key, value] tuple: ${it}`);
          } else if (it && it instanceof Object) {
            const keys = Object.keys(it);
            if (keys.length === 1) {
              key = keys[0];
              value = it[key];
            } else {
              throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
            }
          } else {
            key = it;
          }
          pairs2.items.push(Pair.createPair(key, value, ctx));
        }
      return pairs2;
    }
    var pairs = {
      collection: "seq",
      default: false,
      tag: "tag:yaml.org,2002:pairs",
      resolve: resolvePairs,
      createNode: createPairs
    };
    exports2.createPairs = createPairs;
    exports2.pairs = pairs;
    exports2.resolvePairs = resolvePairs;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/omap.js
var require_omap = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/omap.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var toJS = require_toJS();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var pairs = require_pairs();
    var YAMLOMap = class _YAMLOMap extends YAMLSeq.YAMLSeq {
      constructor() {
        super();
        this.add = YAMLMap.YAMLMap.prototype.add.bind(this);
        this.delete = YAMLMap.YAMLMap.prototype.delete.bind(this);
        this.get = YAMLMap.YAMLMap.prototype.get.bind(this);
        this.has = YAMLMap.YAMLMap.prototype.has.bind(this);
        this.set = YAMLMap.YAMLMap.prototype.set.bind(this);
        this.tag = _YAMLOMap.tag;
      }
      /**
       * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
       * but TypeScript won't allow widening the signature of a child method.
       */
      toJSON(_, ctx) {
        if (!ctx)
          return super.toJSON(_);
        const map = /* @__PURE__ */ new Map();
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const pair of this.items) {
          let key, value;
          if (identity.isPair(pair)) {
            key = toJS.toJS(pair.key, "", ctx);
            value = toJS.toJS(pair.value, key, ctx);
          } else {
            key = toJS.toJS(pair, "", ctx);
          }
          if (map.has(key))
            throw new Error("Ordered maps must not include duplicate keys");
          map.set(key, value);
        }
        return map;
      }
      static from(schema2, iterable, ctx) {
        const pairs$1 = pairs.createPairs(schema2, iterable, ctx);
        const omap2 = new this();
        omap2.items = pairs$1.items;
        return omap2;
      }
    };
    YAMLOMap.tag = "tag:yaml.org,2002:omap";
    var omap = {
      collection: "seq",
      identify: (value) => value instanceof Map,
      nodeClass: YAMLOMap,
      default: false,
      tag: "tag:yaml.org,2002:omap",
      resolve(seq, onError) {
        const pairs$1 = pairs.resolvePairs(seq, onError);
        const seenKeys = [];
        for (const { key } of pairs$1.items) {
          if (identity.isScalar(key)) {
            if (seenKeys.includes(key.value)) {
              onError(`Ordered maps must not include duplicate keys: ${key.value}`);
            } else {
              seenKeys.push(key.value);
            }
          }
        }
        return Object.assign(new YAMLOMap(), pairs$1);
      },
      createNode: (schema2, iterable, ctx) => YAMLOMap.from(schema2, iterable, ctx)
    };
    exports2.YAMLOMap = YAMLOMap;
    exports2.omap = omap;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/bool.js
var require_bool2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/bool.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    function boolStringify({ value, source }, ctx) {
      const boolObj = value ? trueTag : falseTag;
      if (source && boolObj.test.test(source))
        return source;
      return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
    var trueTag = {
      identify: (value) => value === true,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
      resolve: () => new Scalar.Scalar(true),
      stringify: boolStringify
    };
    var falseTag = {
      identify: (value) => value === false,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
      resolve: () => new Scalar.Scalar(false),
      stringify: boolStringify
    };
    exports2.falseTag = falseTag;
    exports2.trueTag = trueTag;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/float.js
var require_float2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/float.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str.replace(/_/g, "")),
      stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str.replace(/_/g, "")));
        const dot = str.indexOf(".");
        if (dot !== -1) {
          const f = str.substring(dot + 1).replace(/_/g, "");
          if (f[f.length - 1] === "0")
            node.minFractionDigits = f.length;
        }
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports2.float = float;
    exports2.floatExp = floatExp;
    exports2.floatNaN = floatNaN;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/int.js
var require_int2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/int.js"(exports2) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    function intResolve(str, offset, radix, { intAsBigInt }) {
      const sign = str[0];
      if (sign === "-" || sign === "+")
        offset += 1;
      str = str.substring(offset).replace(/_/g, "");
      if (intAsBigInt) {
        switch (radix) {
          case 2:
            str = `0b${str}`;
            break;
          case 8:
            str = `0o${str}`;
            break;
          case 16:
            str = `0x${str}`;
            break;
        }
        const n2 = BigInt(str);
        return sign === "-" ? BigInt(-1) * n2 : n2;
      }
      const n = parseInt(str, radix);
      return sign === "-" ? -1 * n : n;
    }
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value)) {
        const str = value.toString(radix);
        return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
      }
      return stringifyNumber.stringifyNumber(node);
    }
    var intBin = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "BIN",
      test: /^[-+]?0b[0-1_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
      stringify: (node) => intStringify(node, 2, "0b")
    };
    var intOct = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^[-+]?0[0-7_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
      stringify: (node) => intStringify(node, 8, "0")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9][0-9_]*$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^[-+]?0x[0-9a-fA-F_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports2.int = int;
    exports2.intBin = intBin;
    exports2.intHex = intHex;
    exports2.intOct = intOct;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/set.js
var require_set = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/set.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSet = class _YAMLSet extends YAMLMap.YAMLMap {
      constructor(schema2) {
        super(schema2);
        this.tag = _YAMLSet.tag;
      }
      add(key) {
        let pair;
        if (identity.isPair(key))
          pair = key;
        else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
          pair = new Pair.Pair(key.key, null);
        else
          pair = new Pair.Pair(key, null);
        const prev = YAMLMap.findPair(this.items, pair.key);
        if (!prev)
          this.items.push(pair);
      }
      /**
       * If `keepPair` is `true`, returns the Pair matching `key`.
       * Otherwise, returns the value of that Pair's key.
       */
      get(key, keepPair) {
        const pair = YAMLMap.findPair(this.items, key);
        return !keepPair && identity.isPair(pair) ? identity.isScalar(pair.key) ? pair.key.value : pair.key : pair;
      }
      set(key, value) {
        if (typeof value !== "boolean")
          throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
        const prev = YAMLMap.findPair(this.items, key);
        if (prev && !value) {
          this.items.splice(this.items.indexOf(prev), 1);
        } else if (!prev && value) {
          this.items.push(new Pair.Pair(key));
        }
      }
      toJSON(_, ctx) {
        return super.toJSON(_, ctx, Set);
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        if (this.hasAllNullValues(true))
          return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
        else
          throw new Error("Set items must all have null values");
      }
      static from(schema2, iterable, ctx) {
        const { replacer } = ctx;
        const set2 = new this(schema2);
        if (iterable && Symbol.iterator in Object(iterable))
          for (let value of iterable) {
            if (typeof replacer === "function")
              value = replacer.call(iterable, value, value);
            set2.items.push(Pair.createPair(value, null, ctx));
          }
        return set2;
      }
    };
    YAMLSet.tag = "tag:yaml.org,2002:set";
    var set = {
      collection: "map",
      identify: (value) => value instanceof Set,
      nodeClass: YAMLSet,
      default: false,
      tag: "tag:yaml.org,2002:set",
      createNode: (schema2, iterable, ctx) => YAMLSet.from(schema2, iterable, ctx),
      resolve(map, onError) {
        if (identity.isMap(map)) {
          if (map.hasAllNullValues(true))
            return Object.assign(new YAMLSet(), map);
          else
            onError("Set items must all have null values");
        } else
          onError("Expected a mapping for this tag");
        return map;
      }
    };
    exports2.YAMLSet = YAMLSet;
    exports2.set = set;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/timestamp.js
var require_timestamp = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/timestamp.js"(exports2) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    function parseSexagesimal(str, asBigInt) {
      const sign = str[0];
      const parts = sign === "-" || sign === "+" ? str.substring(1) : str;
      const num = (n) => asBigInt ? BigInt(n) : Number(n);
      const res = parts.replace(/_/g, "").split(":").reduce((res2, p) => res2 * num(60) + num(p), num(0));
      return sign === "-" ? num(-1) * res : res;
    }
    function stringifySexagesimal(node) {
      let { value } = node;
      let num = (n) => n;
      if (typeof value === "bigint")
        num = (n) => BigInt(n);
      else if (isNaN(value) || !isFinite(value))
        return stringifyNumber.stringifyNumber(node);
      let sign = "";
      if (value < 0) {
        sign = "-";
        value *= num(-1);
      }
      const _60 = num(60);
      const parts = [value % _60];
      if (value < 60) {
        parts.unshift(0);
      } else {
        value = (value - parts[0]) / _60;
        parts.unshift(value % _60);
        if (value >= 60) {
          value = (value - parts[0]) / _60;
          parts.unshift(value);
        }
      }
      return sign + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
    }
    var intTime = {
      identify: (value) => typeof value === "bigint" || Number.isInteger(value),
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
      resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
      stringify: stringifySexagesimal
    };
    var floatTime = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
      resolve: (str) => parseSexagesimal(str, false),
      stringify: stringifySexagesimal
    };
    var timestamp = {
      identify: (value) => value instanceof Date,
      default: true,
      tag: "tag:yaml.org,2002:timestamp",
      // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
      // may be omitted altogether, resulting in a date format. In such a case, the time part is
      // assumed to be 00:00:00Z (start of day, UTC).
      test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
      resolve(str) {
        const match = str.match(timestamp.test);
        if (!match)
          throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
        const [, year, month, day, hour, minute, second] = match.map(Number);
        const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
        let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
        const tz = match[8];
        if (tz && tz !== "Z") {
          let d = parseSexagesimal(tz, false);
          if (Math.abs(d) < 30)
            d *= 60;
          date -= 6e4 * d;
        }
        return new Date(date);
      },
      stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
    };
    exports2.floatTime = floatTime;
    exports2.intTime = intTime;
    exports2.timestamp = timestamp;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/schema.js
var require_schema3 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/schema.js"(exports2) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var binary = require_binary();
    var bool = require_bool2();
    var float = require_float2();
    var int = require_int2();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var set = require_set();
    var timestamp = require_timestamp();
    var schema2 = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.trueTag,
      bool.falseTag,
      int.intBin,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float,
      binary.binary,
      merge.merge,
      omap.omap,
      pairs.pairs,
      set.set,
      timestamp.intTime,
      timestamp.floatTime,
      timestamp.timestamp
    ];
    exports2.schema = schema2;
  }
});

// node_modules/yaml/dist/schema/tags.js
var require_tags = __commonJS({
  "node_modules/yaml/dist/schema/tags.js"(exports2) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema2 = require_schema();
    var schema$1 = require_schema2();
    var binary = require_binary();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var schema$2 = require_schema3();
    var set = require_set();
    var timestamp = require_timestamp();
    var schemas = /* @__PURE__ */ new Map([
      ["core", schema2.schema],
      ["failsafe", [map.map, seq.seq, string.string]],
      ["json", schema$1.schema],
      ["yaml11", schema$2.schema],
      ["yaml-1.1", schema$2.schema]
    ]);
    var tagsByName = {
      binary: binary.binary,
      bool: bool.boolTag,
      float: float.float,
      floatExp: float.floatExp,
      floatNaN: float.floatNaN,
      floatTime: timestamp.floatTime,
      int: int.int,
      intHex: int.intHex,
      intOct: int.intOct,
      intTime: timestamp.intTime,
      map: map.map,
      merge: merge.merge,
      null: _null.nullTag,
      omap: omap.omap,
      pairs: pairs.pairs,
      seq: seq.seq,
      set: set.set,
      timestamp: timestamp.timestamp
    };
    var coreKnownTags = {
      "tag:yaml.org,2002:binary": binary.binary,
      "tag:yaml.org,2002:merge": merge.merge,
      "tag:yaml.org,2002:omap": omap.omap,
      "tag:yaml.org,2002:pairs": pairs.pairs,
      "tag:yaml.org,2002:set": set.set,
      "tag:yaml.org,2002:timestamp": timestamp.timestamp
    };
    function getTags(customTags, schemaName, addMergeTag) {
      const schemaTags = schemas.get(schemaName);
      if (schemaTags && !customTags) {
        return addMergeTag && !schemaTags.includes(merge.merge) ? schemaTags.concat(merge.merge) : schemaTags.slice();
      }
      let tags = schemaTags;
      if (!tags) {
        if (Array.isArray(customTags))
          tags = [];
        else {
          const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
        }
      }
      if (Array.isArray(customTags)) {
        for (const tag of customTags)
          tags = tags.concat(tag);
      } else if (typeof customTags === "function") {
        tags = customTags(tags.slice());
      }
      if (addMergeTag)
        tags = tags.concat(merge.merge);
      return tags.reduce((tags2, tag) => {
        const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
        if (!tagObj) {
          const tagName = JSON.stringify(tag);
          const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
        }
        if (!tags2.includes(tagObj))
          tags2.push(tagObj);
        return tags2;
      }, []);
    }
    exports2.coreKnownTags = coreKnownTags;
    exports2.getTags = getTags;
  }
});

// node_modules/yaml/dist/schema/Schema.js
var require_Schema = __commonJS({
  "node_modules/yaml/dist/schema/Schema.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var map = require_map();
    var seq = require_seq();
    var string = require_string();
    var tags = require_tags();
    var sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    var Schema = class _Schema {
      constructor({ compat, customTags, merge, resolveKnownTags, schema: schema2, sortMapEntries, toStringDefaults }) {
        this.compat = Array.isArray(compat) ? tags.getTags(compat, "compat") : compat ? tags.getTags(null, compat) : null;
        this.name = typeof schema2 === "string" && schema2 || "core";
        this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
        this.tags = tags.getTags(customTags, this.name, merge);
        this.toStringOptions = toStringDefaults ?? null;
        Object.defineProperty(this, identity.MAP, { value: map.map });
        Object.defineProperty(this, identity.SCALAR, { value: string.string });
        Object.defineProperty(this, identity.SEQ, { value: seq.seq });
        this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
      }
      clone() {
        const copy = Object.create(_Schema.prototype, Object.getOwnPropertyDescriptors(this));
        copy.tags = this.tags.slice();
        return copy;
      }
    };
    exports2.Schema = Schema;
  }
});

// node_modules/yaml/dist/stringify/stringifyDocument.js
var require_stringifyDocument = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyDocument.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyDocument(doc, options) {
      const lines = [];
      let hasDirectives = options.directives === true;
      if (options.directives !== false && doc.directives) {
        const dir = doc.directives.toString(doc);
        if (dir) {
          lines.push(dir);
          hasDirectives = true;
        } else if (doc.directives.docStart)
          hasDirectives = true;
      }
      if (hasDirectives)
        lines.push("---");
      const ctx = stringify.createStringifyContext(doc, options);
      const { commentString } = ctx.options;
      if (doc.commentBefore) {
        if (lines.length !== 1)
          lines.unshift("");
        const cs = commentString(doc.commentBefore);
        lines.unshift(stringifyComment.indentComment(cs, ""));
      }
      let chompKeep = false;
      let contentComment = null;
      if (doc.contents) {
        if (identity.isNode(doc.contents)) {
          if (doc.contents.spaceBefore && hasDirectives)
            lines.push("");
          if (doc.contents.commentBefore) {
            const cs = commentString(doc.contents.commentBefore);
            lines.push(stringifyComment.indentComment(cs, ""));
          }
          ctx.forceBlockIndent = !!doc.comment;
          contentComment = doc.contents.comment;
        }
        const onChompKeep = contentComment ? void 0 : () => chompKeep = true;
        let body = stringify.stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
        if (contentComment)
          body += stringifyComment.lineComment(body, "", commentString(contentComment));
        if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
          lines[lines.length - 1] = `--- ${body}`;
        } else
          lines.push(body);
      } else {
        lines.push(stringify.stringify(doc.contents, ctx));
      }
      if (doc.directives?.docEnd) {
        if (doc.comment) {
          const cs = commentString(doc.comment);
          if (cs.includes("\n")) {
            lines.push("...");
            lines.push(stringifyComment.indentComment(cs, ""));
          } else {
            lines.push(`... ${cs}`);
          }
        } else {
          lines.push("...");
        }
      } else {
        let dc = doc.comment;
        if (dc && chompKeep)
          dc = dc.replace(/^\n+/, "");
        if (dc) {
          if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
            lines.push("");
          lines.push(stringifyComment.indentComment(commentString(dc), ""));
        }
      }
      return lines.join("\n") + "\n";
    }
    exports2.stringifyDocument = stringifyDocument;
  }
});

// node_modules/yaml/dist/doc/Document.js
var require_Document = __commonJS({
  "node_modules/yaml/dist/doc/Document.js"(exports2) {
    "use strict";
    var Alias = require_Alias();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var toJS = require_toJS();
    var Schema = require_Schema();
    var stringifyDocument = require_stringifyDocument();
    var anchors = require_anchors();
    var applyReviver = require_applyReviver();
    var createNode = require_createNode();
    var directives = require_directives();
    var Document = class _Document {
      constructor(value, replacer, options) {
        this.commentBefore = null;
        this.comment = null;
        this.errors = [];
        this.warnings = [];
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.DOC });
        let _replacer = null;
        if (typeof replacer === "function" || Array.isArray(replacer)) {
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const opt = Object.assign({
          intAsBigInt: false,
          keepSourceTokens: false,
          logLevel: "warn",
          prettyErrors: true,
          strict: true,
          stringKeys: false,
          uniqueKeys: true,
          version: "1.2"
        }, options);
        this.options = opt;
        let { version } = opt;
        if (options?._directives) {
          this.directives = options._directives.atDocument();
          if (this.directives.yaml.explicit)
            version = this.directives.yaml.version;
        } else
          this.directives = new directives.Directives({ version });
        this.setSchema(version, options);
        this.contents = value === void 0 ? null : this.createNode(value, _replacer, options);
      }
      /**
       * Create a deep copy of this Document and its contents.
       *
       * Custom Node values that inherit from `Object` still refer to their original instances.
       */
      clone() {
        const copy = Object.create(_Document.prototype, {
          [identity.NODE_TYPE]: { value: identity.DOC }
        });
        copy.commentBefore = this.commentBefore;
        copy.comment = this.comment;
        copy.errors = this.errors.slice();
        copy.warnings = this.warnings.slice();
        copy.options = Object.assign({}, this.options);
        if (this.directives)
          copy.directives = this.directives.clone();
        copy.schema = this.schema.clone();
        copy.contents = identity.isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** Adds a value to the document. */
      add(value) {
        if (assertCollection(this.contents))
          this.contents.add(value);
      }
      /** Adds a value to the document. */
      addIn(path20, value) {
        if (assertCollection(this.contents))
          this.contents.addIn(path20, value);
      }
      /**
       * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
       *
       * If `node` already has an anchor, `name` is ignored.
       * Otherwise, the `node.anchor` value will be set to `name`,
       * or if an anchor with that name is already present in the document,
       * `name` will be used as a prefix for a new unique anchor.
       * If `name` is undefined, the generated anchor will use 'a' as a prefix.
       */
      createAlias(node, name) {
        if (!node.anchor) {
          const prev = anchors.anchorNames(this);
          node.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          !name || prev.has(name) ? anchors.findNewAnchor(name || "a", prev) : name;
        }
        return new Alias.Alias(node.anchor);
      }
      createNode(value, replacer, options) {
        let _replacer = void 0;
        if (typeof replacer === "function") {
          value = replacer.call({ "": value }, "", value);
          _replacer = replacer;
        } else if (Array.isArray(replacer)) {
          const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
          const asStr = replacer.filter(keyToStr).map(String);
          if (asStr.length > 0)
            replacer = replacer.concat(asStr);
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
        const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(
          this,
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          anchorPrefix || "a"
        );
        const ctx = {
          aliasDuplicateObjects: aliasDuplicateObjects ?? true,
          keepUndefined: keepUndefined ?? false,
          onAnchor,
          onTagObj,
          replacer: _replacer,
          schema: this.schema,
          sourceObjects
        };
        const node = createNode.createNode(value, tag, ctx);
        if (flow && identity.isCollection(node))
          node.flow = true;
        setAnchors();
        return node;
      }
      /**
       * Convert a key and a value into a `Pair` using the current schema,
       * recursively wrapping all values as `Scalar` or `Collection` nodes.
       */
      createPair(key, value, options = {}) {
        const k = this.createNode(key, null, options);
        const v = this.createNode(value, null, options);
        return new Pair.Pair(k, v);
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        return assertCollection(this.contents) ? this.contents.delete(key) : false;
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path20) {
        if (Collection.isEmptyPath(path20)) {
          if (this.contents == null)
            return false;
          this.contents = null;
          return true;
        }
        return assertCollection(this.contents) ? this.contents.deleteIn(path20) : false;
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      get(key, keepScalar) {
        return identity.isCollection(this.contents) ? this.contents.get(key, keepScalar) : void 0;
      }
      /**
       * Returns item at `path`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path20, keepScalar) {
        if (Collection.isEmptyPath(path20))
          return !keepScalar && identity.isScalar(this.contents) ? this.contents.value : this.contents;
        return identity.isCollection(this.contents) ? this.contents.getIn(path20, keepScalar) : void 0;
      }
      /**
       * Checks if the document includes a value with the key `key`.
       */
      has(key) {
        return identity.isCollection(this.contents) ? this.contents.has(key) : false;
      }
      /**
       * Checks if the document includes a value at `path`.
       */
      hasIn(path20) {
        if (Collection.isEmptyPath(path20))
          return this.contents !== void 0;
        return identity.isCollection(this.contents) ? this.contents.hasIn(path20) : false;
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      set(key, value) {
        if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, [key], value);
        } else if (assertCollection(this.contents)) {
          this.contents.set(key, value);
        }
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path20, value) {
        if (Collection.isEmptyPath(path20)) {
          this.contents = value;
        } else if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, Array.from(path20), value);
        } else if (assertCollection(this.contents)) {
          this.contents.setIn(path20, value);
        }
      }
      /**
       * Change the YAML version and schema used by the document.
       * A `null` version disables support for directives, explicit tags, anchors, and aliases.
       * It also requires the `schema` option to be given as a `Schema` instance value.
       *
       * Overrides all previously set schema options.
       */
      setSchema(version, options = {}) {
        if (typeof version === "number")
          version = String(version);
        let opt;
        switch (version) {
          case "1.1":
            if (this.directives)
              this.directives.yaml.version = "1.1";
            else
              this.directives = new directives.Directives({ version: "1.1" });
            opt = { resolveKnownTags: false, schema: "yaml-1.1" };
            break;
          case "1.2":
          case "next":
            if (this.directives)
              this.directives.yaml.version = version;
            else
              this.directives = new directives.Directives({ version });
            opt = { resolveKnownTags: true, schema: "core" };
            break;
          case null:
            if (this.directives)
              delete this.directives;
            opt = null;
            break;
          default: {
            const sv = JSON.stringify(version);
            throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
          }
        }
        if (options.schema instanceof Object)
          this.schema = options.schema;
        else if (opt)
          this.schema = new Schema.Schema(Object.assign(opt, options));
        else
          throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
      }
      // json & jsonArg are only used from toJSON()
      toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc: this,
          keep: !json,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this.contents, jsonArg ?? "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
      /**
       * A JSON representation of the document `contents`.
       *
       * @param jsonArg Used by `JSON.stringify` to indicate the array index or
       *   property name.
       */
      toJSON(jsonArg, onAnchor) {
        return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
      }
      /** A YAML representation of the document. */
      toString(options = {}) {
        if (this.errors.length > 0)
          throw new Error("Document with errors cannot be stringified");
        if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
          const s = JSON.stringify(options.indent);
          throw new Error(`"indent" option must be a positive integer, not ${s}`);
        }
        return stringifyDocument.stringifyDocument(this, options);
      }
    };
    function assertCollection(contents) {
      if (identity.isCollection(contents))
        return true;
      throw new Error("Expected a YAML collection as document contents");
    }
    exports2.Document = Document;
  }
});

// node_modules/yaml/dist/errors.js
var require_errors = __commonJS({
  "node_modules/yaml/dist/errors.js"(exports2) {
    "use strict";
    var YAMLError = class extends Error {
      constructor(name, pos, code, message) {
        super();
        this.name = name;
        this.code = code;
        this.message = message;
        this.pos = pos;
      }
    };
    var YAMLParseError = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLParseError", pos, code, message);
      }
    };
    var YAMLWarning = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLWarning", pos, code, message);
      }
    };
    var prettifyError = (src, lc) => (error) => {
      if (error.pos[0] === -1)
        return;
      error.linePos = error.pos.map((pos) => lc.linePos(pos));
      const { line, col } = error.linePos[0];
      error.message += ` at line ${line}, column ${col}`;
      let ci = col - 1;
      let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
      if (ci >= 60 && lineStr.length > 80) {
        const trimStart = Math.min(ci - 39, lineStr.length - 79);
        lineStr = "\u2026" + lineStr.substring(trimStart);
        ci -= trimStart - 1;
      }
      if (lineStr.length > 80)
        lineStr = lineStr.substring(0, 79) + "\u2026";
      if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
        let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
        if (prev.length > 80)
          prev = prev.substring(0, 79) + "\u2026\n";
        lineStr = prev + lineStr;
      }
      if (/[^ ]/.test(lineStr)) {
        let count = 1;
        const end = error.linePos[1];
        if (end && end.line === line && end.col > col) {
          count = Math.max(1, Math.min(end.col - col, 80 - ci));
        }
        const pointer = " ".repeat(ci) + "^".repeat(count);
        error.message += `:

${lineStr}
${pointer}
`;
      }
    };
    exports2.YAMLError = YAMLError;
    exports2.YAMLParseError = YAMLParseError;
    exports2.YAMLWarning = YAMLWarning;
    exports2.prettifyError = prettifyError;
  }
});

// node_modules/yaml/dist/compose/resolve-props.js
var require_resolve_props = __commonJS({
  "node_modules/yaml/dist/compose/resolve-props.js"(exports2) {
    "use strict";
    function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
      let spaceBefore = false;
      let atNewline = startOnNewline;
      let hasSpace = startOnNewline;
      let comment = "";
      let commentSep = "";
      let hasNewline = false;
      let reqSpace = false;
      let tab = null;
      let anchor = null;
      let tag = null;
      let newlineAfterProp = null;
      let comma = null;
      let found = null;
      let start = null;
      for (const token of tokens) {
        if (reqSpace) {
          if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
            onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
          reqSpace = false;
        }
        if (tab) {
          if (atNewline && token.type !== "comment" && token.type !== "newline") {
            onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
          }
          tab = null;
        }
        switch (token.type) {
          case "space":
            if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("	")) {
              tab = token;
            }
            hasSpace = true;
            break;
          case "comment": {
            if (!hasSpace)
              onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const cb = token.source.substring(1) || " ";
            if (!comment)
              comment = cb;
            else
              comment += commentSep + cb;
            commentSep = "";
            atNewline = false;
            break;
          }
          case "newline":
            if (atNewline) {
              if (comment)
                comment += token.source;
              else if (!found || indicator !== "seq-item-ind")
                spaceBefore = true;
            } else
              commentSep += token.source;
            atNewline = true;
            hasNewline = true;
            if (anchor || tag)
              newlineAfterProp = token;
            hasSpace = true;
            break;
          case "anchor":
            if (anchor)
              onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
            if (token.source.endsWith(":"))
              onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
            anchor = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          case "tag": {
            if (tag)
              onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
            tag = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          }
          case indicator:
            if (anchor || tag)
              onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
            if (found)
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
            found = token;
            atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
            hasSpace = false;
            break;
          case "comma":
            if (flow) {
              if (comma)
                onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
              comma = token;
              atNewline = false;
              hasSpace = false;
              break;
            }
          // else fallthrough
          default:
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
            atNewline = false;
            hasSpace = false;
        }
      }
      const last = tokens[tokens.length - 1];
      const end = last ? last.offset + last.source.length : offset;
      if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
        onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
      }
      if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq"))
        onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
      return {
        comma,
        found,
        spaceBefore,
        comment,
        hasNewline,
        anchor,
        tag,
        newlineAfterProp,
        end,
        start: start ?? end
      };
    }
    exports2.resolveProps = resolveProps;
  }
});

// node_modules/yaml/dist/compose/util-contains-newline.js
var require_util_contains_newline = __commonJS({
  "node_modules/yaml/dist/compose/util-contains-newline.js"(exports2) {
    "use strict";
    function containsNewline(key) {
      if (!key)
        return null;
      switch (key.type) {
        case "alias":
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          if (key.source.includes("\n"))
            return true;
          if (key.end) {
            for (const st of key.end)
              if (st.type === "newline")
                return true;
          }
          return false;
        case "flow-collection":
          for (const it of key.items) {
            for (const st of it.start)
              if (st.type === "newline")
                return true;
            if (it.sep) {
              for (const st of it.sep)
                if (st.type === "newline")
                  return true;
            }
            if (containsNewline(it.key) || containsNewline(it.value))
              return true;
          }
          return false;
        default:
          return true;
      }
    }
    exports2.containsNewline = containsNewline;
  }
});

// node_modules/yaml/dist/compose/util-flow-indent-check.js
var require_util_flow_indent_check = __commonJS({
  "node_modules/yaml/dist/compose/util-flow-indent-check.js"(exports2) {
    "use strict";
    var utilContainsNewline = require_util_contains_newline();
    function flowIndentCheck(indent, fc, onError) {
      if (fc?.type === "flow-collection") {
        const end = fc.end[0];
        if (end.indent === indent && (end.source === "]" || end.source === "}") && utilContainsNewline.containsNewline(fc)) {
          const msg = "Flow end indicator should be more indented than parent";
          onError(end, "BAD_INDENT", msg, true);
        }
      }
    }
    exports2.flowIndentCheck = flowIndentCheck;
  }
});

// node_modules/yaml/dist/compose/util-map-includes.js
var require_util_map_includes = __commonJS({
  "node_modules/yaml/dist/compose/util-map-includes.js"(exports2) {
    "use strict";
    var identity = require_identity();
    function mapIncludes(ctx, items, search) {
      const { uniqueKeys } = ctx.options;
      if (uniqueKeys === false)
        return false;
      const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || identity.isScalar(a) && identity.isScalar(b) && a.value === b.value;
      return items.some((pair) => isEqual(pair.key, search));
    }
    exports2.mapIncludes = mapIncludes;
  }
});

// node_modules/yaml/dist/compose/resolve-block-map.js
var require_resolve_block_map = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-map.js"(exports2) {
    "use strict";
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    var utilMapIncludes = require_util_map_includes();
    var startColMsg = "All mapping items must start at the same column";
    function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLMap.YAMLMap;
      const map = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      let offset = bm.offset;
      let commentEnd = null;
      for (const collItem of bm.items) {
        const { start, key, sep, value } = collItem;
        const keyProps = resolveProps.resolveProps(start, {
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: bm.indent,
          startOnNewline: true
        });
        const implicitKey = !keyProps.found;
        if (implicitKey) {
          if (key) {
            if (key.type === "block-seq")
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
            else if ("indent" in key && key.indent !== bm.indent)
              onError(offset, "BAD_INDENT", startColMsg);
          }
          if (!keyProps.anchor && !keyProps.tag && !sep) {
            commentEnd = keyProps.end;
            if (keyProps.comment) {
              if (map.comment)
                map.comment += "\n" + keyProps.comment;
              else
                map.comment = keyProps.comment;
            }
            continue;
          }
          if (keyProps.newlineAfterProp || utilContainsNewline.containsNewline(key)) {
            onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
          }
        } else if (keyProps.found?.indent !== bm.indent) {
          onError(offset, "BAD_INDENT", startColMsg);
        }
        ctx.atKey = true;
        const keyStart = keyProps.end;
        const keyNode = key ? composeNode(ctx, key, keyProps, onError) : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bm.indent, key, onError);
        ctx.atKey = false;
        if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
          onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
        const valueProps = resolveProps.resolveProps(sep ?? [], {
          indicator: "map-value-ind",
          next: value,
          offset: keyNode.range[2],
          onError,
          parentIndent: bm.indent,
          startOnNewline: !key || key.type === "block-scalar"
        });
        offset = valueProps.end;
        if (valueProps.found) {
          if (implicitKey) {
            if (value?.type === "block-map" && !valueProps.hasNewline)
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
            if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
              onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
          if (ctx.schema.compat)
            utilFlowIndentCheck.flowIndentCheck(bm.indent, value, onError);
          offset = valueNode.range[2];
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        } else {
          if (implicitKey)
            onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
          if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        }
      }
      if (commentEnd && commentEnd < offset)
        onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
      map.range = [bm.offset, offset, commentEnd ?? offset];
      return map;
    }
    exports2.resolveBlockMap = resolveBlockMap;
  }
});

// node_modules/yaml/dist/compose/resolve-block-seq.js
var require_resolve_block_seq = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-seq.js"(exports2) {
    "use strict";
    var YAMLSeq = require_YAMLSeq();
    var resolveProps = require_resolve_props();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLSeq.YAMLSeq;
      const seq = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = bs.offset;
      let commentEnd = null;
      for (const { start, value } of bs.items) {
        const props = resolveProps.resolveProps(start, {
          indicator: "seq-item-ind",
          next: value,
          offset,
          onError,
          parentIndent: bs.indent,
          startOnNewline: true
        });
        if (!props.found) {
          if (props.anchor || props.tag || value) {
            if (value && value.type === "block-seq")
              onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
            else
              onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
          } else {
            commentEnd = props.end;
            if (props.comment)
              seq.comment = props.comment;
            continue;
          }
        }
        const node = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bs.indent, value, onError);
        offset = node.range[2];
        seq.items.push(node);
      }
      seq.range = [bs.offset, offset, commentEnd ?? offset];
      return seq;
    }
    exports2.resolveBlockSeq = resolveBlockSeq;
  }
});

// node_modules/yaml/dist/compose/resolve-end.js
var require_resolve_end = __commonJS({
  "node_modules/yaml/dist/compose/resolve-end.js"(exports2) {
    "use strict";
    function resolveEnd(end, offset, reqSpace, onError) {
      let comment = "";
      if (end) {
        let hasSpace = false;
        let sep = "";
        for (const token of end) {
          const { source, type } = token;
          switch (type) {
            case "space":
              hasSpace = true;
              break;
            case "comment": {
              if (reqSpace && !hasSpace)
                onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
              const cb = source.substring(1) || " ";
              if (!comment)
                comment = cb;
              else
                comment += sep + cb;
              sep = "";
              break;
            }
            case "newline":
              if (comment)
                sep += source;
              hasSpace = true;
              break;
            default:
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
          }
          offset += source.length;
        }
      }
      return { comment, offset };
    }
    exports2.resolveEnd = resolveEnd;
  }
});

// node_modules/yaml/dist/compose/resolve-flow-collection.js
var require_resolve_flow_collection = __commonJS({
  "node_modules/yaml/dist/compose/resolve-flow-collection.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilMapIncludes = require_util_map_includes();
    var blockMsg = "Block collections are not allowed within flow collections";
    var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
    function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
      const isMap = fc.start.source === "{";
      const fcName = isMap ? "flow map" : "flow sequence";
      const NodeClass = tag?.nodeClass ?? (isMap ? YAMLMap.YAMLMap : YAMLSeq.YAMLSeq);
      const coll = new NodeClass(ctx.schema);
      coll.flow = true;
      const atRoot = ctx.atRoot;
      if (atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = fc.offset + fc.start.source.length;
      for (let i = 0; i < fc.items.length; ++i) {
        const collItem = fc.items[i];
        const { start, key, sep, value } = collItem;
        const props = resolveProps.resolveProps(start, {
          flow: fcName,
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: fc.indent,
          startOnNewline: false
        });
        if (!props.found) {
          if (!props.anchor && !props.tag && !sep && !value) {
            if (i === 0 && props.comma)
              onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
            else if (i < fc.items.length - 1)
              onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
            if (props.comment) {
              if (coll.comment)
                coll.comment += "\n" + props.comment;
              else
                coll.comment = props.comment;
            }
            offset = props.end;
            continue;
          }
          if (!isMap && ctx.options.strict && utilContainsNewline.containsNewline(key))
            onError(
              key,
              // checked by containsNewline()
              "MULTILINE_IMPLICIT_KEY",
              "Implicit keys of flow sequence pairs need to be on a single line"
            );
        }
        if (i === 0) {
          if (props.comma)
            onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
        } else {
          if (!props.comma)
            onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
          if (props.comment) {
            let prevItemComment = "";
            loop: for (const st of start) {
              switch (st.type) {
                case "comma":
                case "space":
                  break;
                case "comment":
                  prevItemComment = st.source.substring(1);
                  break loop;
                default:
                  break loop;
              }
            }
            if (prevItemComment) {
              let prev = coll.items[coll.items.length - 1];
              if (identity.isPair(prev))
                prev = prev.value ?? prev.key;
              if (prev.comment)
                prev.comment += "\n" + prevItemComment;
              else
                prev.comment = prevItemComment;
              props.comment = props.comment.substring(prevItemComment.length + 1);
            }
          }
        }
        if (!isMap && !sep && !props.found) {
          const valueNode = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, sep, null, props, onError);
          coll.items.push(valueNode);
          offset = valueNode.range[2];
          if (isBlock(value))
            onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
        } else {
          ctx.atKey = true;
          const keyStart = props.end;
          const keyNode = key ? composeNode(ctx, key, props, onError) : composeEmptyNode(ctx, keyStart, start, null, props, onError);
          if (isBlock(key))
            onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
          ctx.atKey = false;
          const valueProps = resolveProps.resolveProps(sep ?? [], {
            flow: fcName,
            indicator: "map-value-ind",
            next: value,
            offset: keyNode.range[2],
            onError,
            parentIndent: fc.indent,
            startOnNewline: false
          });
          if (valueProps.found) {
            if (!isMap && !props.found && ctx.options.strict) {
              if (sep)
                for (const st of sep) {
                  if (st === valueProps.found)
                    break;
                  if (st.type === "newline") {
                    onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                    break;
                  }
                }
              if (props.start < valueProps.found.offset - 1024)
                onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
            }
          } else if (value) {
            if ("source" in value && value.source && value.source[0] === ":")
              onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
            else
              onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError) : null;
          if (valueNode) {
            if (isBlock(value))
              onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
          } else if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          if (isMap) {
            const map = coll;
            if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
              onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
            map.items.push(pair);
          } else {
            const map = new YAMLMap.YAMLMap(ctx.schema);
            map.flow = true;
            map.items.push(pair);
            const endRange = (valueNode ?? keyNode).range;
            map.range = [keyNode.range[0], endRange[1], endRange[2]];
            coll.items.push(map);
          }
          offset = valueNode ? valueNode.range[2] : valueProps.end;
        }
      }
      const expectedEnd = isMap ? "}" : "]";
      const [ce, ...ee] = fc.end;
      let cePos = offset;
      if (ce && ce.source === expectedEnd)
        cePos = ce.offset + ce.source.length;
      else {
        const name = fcName[0].toUpperCase() + fcName.substring(1);
        const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
        onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
        if (ce && ce.source.length !== 1)
          ee.unshift(ce);
      }
      if (ee.length > 0) {
        const end = resolveEnd.resolveEnd(ee, cePos, ctx.options.strict, onError);
        if (end.comment) {
          if (coll.comment)
            coll.comment += "\n" + end.comment;
          else
            coll.comment = end.comment;
        }
        coll.range = [fc.offset, cePos, end.offset];
      } else {
        coll.range = [fc.offset, cePos, cePos];
      }
      return coll;
    }
    exports2.resolveFlowCollection = resolveFlowCollection;
  }
});

// node_modules/yaml/dist/compose/compose-collection.js
var require_compose_collection = __commonJS({
  "node_modules/yaml/dist/compose/compose-collection.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveBlockMap = require_resolve_block_map();
    var resolveBlockSeq = require_resolve_block_seq();
    var resolveFlowCollection = require_resolve_flow_collection();
    function resolveCollection(CN, ctx, token, onError, tagName, tag) {
      const coll = token.type === "block-map" ? resolveBlockMap.resolveBlockMap(CN, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError, tag) : resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError, tag);
      const Coll = coll.constructor;
      if (tagName === "!" || tagName === Coll.tagName) {
        coll.tag = Coll.tagName;
        return coll;
      }
      if (tagName)
        coll.tag = tagName;
      return coll;
    }
    function composeCollection(CN, ctx, token, props, onError) {
      const tagToken = props.tag;
      const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
      if (token.type === "block-seq") {
        const { anchor, newlineAfterProp: nl } = props;
        const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
        if (lastProp && (!nl || nl.offset < lastProp.offset)) {
          const message = "Missing newline after block sequence props";
          onError(lastProp, "MISSING_CHAR", message);
        }
      }
      const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
      if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.YAMLSeq.tagName && expType === "seq") {
        return resolveCollection(CN, ctx, token, onError, tagName);
      }
      let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
      if (!tag) {
        const kt = ctx.schema.knownTags[tagName];
        if (kt && kt.collection === expType) {
          ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
          tag = kt;
        } else {
          if (kt) {
            onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`, true);
          } else {
            onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
          }
          return resolveCollection(CN, ctx, token, onError, tagName);
        }
      }
      const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
      const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
      const node = identity.isNode(res) ? res : new Scalar.Scalar(res);
      node.range = coll.range;
      node.tag = tagName;
      if (tag?.format)
        node.format = tag.format;
      return node;
    }
    exports2.composeCollection = composeCollection;
  }
});

// node_modules/yaml/dist/compose/resolve-block-scalar.js
var require_resolve_block_scalar = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-scalar.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    function resolveBlockScalar(ctx, scalar, onError) {
      const start = scalar.offset;
      const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
      if (!header)
        return { value: "", type: null, comment: "", range: [start, start, start] };
      const type = header.mode === ">" ? Scalar.Scalar.BLOCK_FOLDED : Scalar.Scalar.BLOCK_LITERAL;
      const lines = scalar.source ? splitLines(scalar.source) : [];
      let chompStart = lines.length;
      for (let i = lines.length - 1; i >= 0; --i) {
        const content = lines[i][1];
        if (content === "" || content === "\r")
          chompStart = i;
        else
          break;
      }
      if (chompStart === 0) {
        const value2 = header.chomp === "+" && lines.length > 0 ? "\n".repeat(Math.max(1, lines.length - 1)) : "";
        let end2 = start + header.length;
        if (scalar.source)
          end2 += scalar.source.length;
        return { value: value2, type, comment: header.comment, range: [start, end2, end2] };
      }
      let trimIndent = scalar.indent + header.indent;
      let offset = scalar.offset + header.length;
      let contentStart = 0;
      for (let i = 0; i < chompStart; ++i) {
        const [indent, content] = lines[i];
        if (content === "" || content === "\r") {
          if (header.indent === 0 && indent.length > trimIndent)
            trimIndent = indent.length;
        } else {
          if (indent.length < trimIndent) {
            const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
            onError(offset + indent.length, "MISSING_CHAR", message);
          }
          if (header.indent === 0)
            trimIndent = indent.length;
          contentStart = i;
          if (trimIndent === 0 && !ctx.atRoot) {
            const message = "Block scalar values in collections must be indented";
            onError(offset, "BAD_INDENT", message);
          }
          break;
        }
        offset += indent.length + content.length + 1;
      }
      for (let i = lines.length - 1; i >= chompStart; --i) {
        if (lines[i][0].length > trimIndent)
          chompStart = i + 1;
      }
      let value = "";
      let sep = "";
      let prevMoreIndented = false;
      for (let i = 0; i < contentStart; ++i)
        value += lines[i][0].slice(trimIndent) + "\n";
      for (let i = contentStart; i < chompStart; ++i) {
        let [indent, content] = lines[i];
        offset += indent.length + content.length + 1;
        const crlf = content[content.length - 1] === "\r";
        if (crlf)
          content = content.slice(0, -1);
        if (content && indent.length < trimIndent) {
          const src = header.indent ? "explicit indentation indicator" : "first line";
          const message = `Block scalar lines must not be less indented than their ${src}`;
          onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
          indent = "";
        }
        if (type === Scalar.Scalar.BLOCK_LITERAL) {
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
        } else if (indent.length > trimIndent || content[0] === "	") {
          if (sep === " ")
            sep = "\n";
          else if (!prevMoreIndented && sep === "\n")
            sep = "\n\n";
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
          prevMoreIndented = true;
        } else if (content === "") {
          if (sep === "\n")
            value += "\n";
          else
            sep = "\n";
        } else {
          value += sep + content;
          sep = " ";
          prevMoreIndented = false;
        }
      }
      switch (header.chomp) {
        case "-":
          break;
        case "+":
          for (let i = chompStart; i < lines.length; ++i)
            value += "\n" + lines[i][0].slice(trimIndent);
          if (value[value.length - 1] !== "\n")
            value += "\n";
          break;
        default:
          value += "\n";
      }
      const end = start + header.length + scalar.source.length;
      return { value, type, comment: header.comment, range: [start, end, end] };
    }
    function parseBlockScalarHeader({ offset, props }, strict, onError) {
      if (props[0].type !== "block-scalar-header") {
        onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
        return null;
      }
      const { source } = props[0];
      const mode = source[0];
      let indent = 0;
      let chomp = "";
      let error = -1;
      for (let i = 1; i < source.length; ++i) {
        const ch = source[i];
        if (!chomp && (ch === "-" || ch === "+"))
          chomp = ch;
        else {
          const n = Number(ch);
          if (!indent && n)
            indent = n;
          else if (error === -1)
            error = offset + i;
        }
      }
      if (error !== -1)
        onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
      let hasSpace = false;
      let comment = "";
      let length = source.length;
      for (let i = 1; i < props.length; ++i) {
        const token = props[i];
        switch (token.type) {
          case "space":
            hasSpace = true;
          // fallthrough
          case "newline":
            length += token.source.length;
            break;
          case "comment":
            if (strict && !hasSpace) {
              const message = "Comments must be separated from other tokens by white space characters";
              onError(token, "MISSING_CHAR", message);
            }
            length += token.source.length;
            comment = token.source.substring(1);
            break;
          case "error":
            onError(token, "UNEXPECTED_TOKEN", token.message);
            length += token.source.length;
            break;
          /* istanbul ignore next should not happen */
          default: {
            const message = `Unexpected token in block scalar header: ${token.type}`;
            onError(token, "UNEXPECTED_TOKEN", message);
            const ts = token.source;
            if (ts && typeof ts === "string")
              length += ts.length;
          }
        }
      }
      return { mode, indent, chomp, comment, length };
    }
    function splitLines(source) {
      const split = source.split(/\n( *)/);
      const first = split[0];
      const m = first.match(/^( *)/);
      const line0 = m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first];
      const lines = [line0];
      for (let i = 1; i < split.length; i += 2)
        lines.push([split[i], split[i + 1]]);
      return lines;
    }
    exports2.resolveBlockScalar = resolveBlockScalar;
  }
});

// node_modules/yaml/dist/compose/resolve-flow-scalar.js
var require_resolve_flow_scalar = __commonJS({
  "node_modules/yaml/dist/compose/resolve-flow-scalar.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var resolveEnd = require_resolve_end();
    function resolveFlowScalar(scalar, strict, onError) {
      const { offset, type, source, end } = scalar;
      let _type;
      let value;
      const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
      switch (type) {
        case "scalar":
          _type = Scalar.Scalar.PLAIN;
          value = plainValue(source, _onError);
          break;
        case "single-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_SINGLE;
          value = singleQuotedValue(source, _onError);
          break;
        case "double-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_DOUBLE;
          value = doubleQuotedValue(source, _onError);
          break;
        /* istanbul ignore next should not happen */
        default:
          onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
          return {
            value: "",
            type: null,
            comment: "",
            range: [offset, offset + source.length, offset + source.length]
          };
      }
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, strict, onError);
      return {
        value,
        type: _type,
        comment: re.comment,
        range: [offset, valueEnd, re.offset]
      };
    }
    function plainValue(source, onError) {
      let badChar = "";
      switch (source[0]) {
        /* istanbul ignore next should not happen */
        case "	":
          badChar = "a tab character";
          break;
        case ",":
          badChar = "flow indicator character ,";
          break;
        case "%":
          badChar = "directive indicator character %";
          break;
        case "|":
        case ">": {
          badChar = `block scalar indicator ${source[0]}`;
          break;
        }
        case "@":
        case "`": {
          badChar = `reserved character ${source[0]}`;
          break;
        }
      }
      if (badChar)
        onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
      return foldLines(source);
    }
    function singleQuotedValue(source, onError) {
      if (source[source.length - 1] !== "'" || source.length === 1)
        onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
      return foldLines(source.slice(1, -1)).replace(/''/g, "'");
    }
    function foldLines(source) {
      let first, line;
      try {
        first = new RegExp("(.*?)(?<![ 	])[ 	]*\r?\n", "sy");
        line = new RegExp("[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?\n", "sy");
      } catch {
        first = /(.*?)[ \t]*\r?\n/sy;
        line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
      }
      let match = first.exec(source);
      if (!match)
        return source;
      let res = match[1];
      let sep = " ";
      let pos = first.lastIndex;
      line.lastIndex = pos;
      while (match = line.exec(source)) {
        if (match[1] === "") {
          if (sep === "\n")
            res += sep;
          else
            sep = "\n";
        } else {
          res += sep + match[1];
          sep = " ";
        }
        pos = line.lastIndex;
      }
      const last = /[ \t]*(.*)/sy;
      last.lastIndex = pos;
      match = last.exec(source);
      return res + sep + (match?.[1] ?? "");
    }
    function doubleQuotedValue(source, onError) {
      let res = "";
      for (let i = 1; i < source.length - 1; ++i) {
        const ch = source[i];
        if (ch === "\r" && source[i + 1] === "\n")
          continue;
        if (ch === "\n") {
          const { fold, offset } = foldNewline(source, i);
          res += fold;
          i = offset;
        } else if (ch === "\\") {
          let next = source[++i];
          const cc = escapeCodes[next];
          if (cc)
            res += cc;
          else if (next === "\n") {
            next = source[i + 1];
            while (next === " " || next === "	")
              next = source[++i + 1];
          } else if (next === "\r" && source[i + 1] === "\n") {
            next = source[++i + 1];
            while (next === " " || next === "	")
              next = source[++i + 1];
          } else if (next === "x" || next === "u" || next === "U") {
            const length = { x: 2, u: 4, U: 8 }[next];
            res += parseCharCode(source, i + 1, length, onError);
            i += length;
          } else {
            const raw = source.substr(i - 1, 2);
            onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
            res += raw;
          }
        } else if (ch === " " || ch === "	") {
          const wsStart = i;
          let next = source[i + 1];
          while (next === " " || next === "	")
            next = source[++i + 1];
          if (next !== "\n" && !(next === "\r" && source[i + 2] === "\n"))
            res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
        } else {
          res += ch;
        }
      }
      if (source[source.length - 1] !== '"' || source.length === 1)
        onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
      return res;
    }
    function foldNewline(source, offset) {
      let fold = "";
      let ch = source[offset + 1];
      while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
        if (ch === "\r" && source[offset + 2] !== "\n")
          break;
        if (ch === "\n")
          fold += "\n";
        offset += 1;
        ch = source[offset + 1];
      }
      if (!fold)
        fold = " ";
      return { fold, offset };
    }
    var escapeCodes = {
      "0": "\0",
      // null character
      a: "\x07",
      // bell character
      b: "\b",
      // backspace
      e: "\x1B",
      // escape character
      f: "\f",
      // form feed
      n: "\n",
      // line feed
      r: "\r",
      // carriage return
      t: "	",
      // horizontal tab
      v: "\v",
      // vertical tab
      N: "\x85",
      // Unicode next line
      _: "\xA0",
      // Unicode non-breaking space
      L: "\u2028",
      // Unicode line separator
      P: "\u2029",
      // Unicode paragraph separator
      " ": " ",
      '"': '"',
      "/": "/",
      "\\": "\\",
      "	": "	"
    };
    function parseCharCode(source, offset, length, onError) {
      const cc = source.substr(offset, length);
      const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
      const code = ok ? parseInt(cc, 16) : NaN;
      if (isNaN(code)) {
        const raw = source.substr(offset - 2, length + 2);
        onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
        return raw;
      }
      return String.fromCodePoint(code);
    }
    exports2.resolveFlowScalar = resolveFlowScalar;
  }
});

// node_modules/yaml/dist/compose/compose-scalar.js
var require_compose_scalar = __commonJS({
  "node_modules/yaml/dist/compose/compose-scalar.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    function composeScalar(ctx, token, tagToken, onError) {
      const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar.resolveBlockScalar(ctx, token, onError) : resolveFlowScalar.resolveFlowScalar(token, ctx.options.strict, onError);
      const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
      let tag;
      if (ctx.options.stringKeys && ctx.atKey) {
        tag = ctx.schema[identity.SCALAR];
      } else if (tagName)
        tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
      else if (token.type === "scalar")
        tag = findScalarTagByTest(ctx, value, token, onError);
      else
        tag = ctx.schema[identity.SCALAR];
      let scalar;
      try {
        const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
        scalar = identity.isScalar(res) ? res : new Scalar.Scalar(res);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
        scalar = new Scalar.Scalar(value);
      }
      scalar.range = range;
      scalar.source = value;
      if (type)
        scalar.type = type;
      if (tagName)
        scalar.tag = tagName;
      if (tag.format)
        scalar.format = tag.format;
      if (comment)
        scalar.comment = comment;
      return scalar;
    }
    function findScalarTagByName(schema2, value, tagName, tagToken, onError) {
      if (tagName === "!")
        return schema2[identity.SCALAR];
      const matchWithTest = [];
      for (const tag of schema2.tags) {
        if (!tag.collection && tag.tag === tagName) {
          if (tag.default && tag.test)
            matchWithTest.push(tag);
          else
            return tag;
        }
      }
      for (const tag of matchWithTest)
        if (tag.test?.test(value))
          return tag;
      const kt = schema2.knownTags[tagName];
      if (kt && !kt.collection) {
        schema2.tags.push(Object.assign({}, kt, { default: false, test: void 0 }));
        return kt;
      }
      onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
      return schema2[identity.SCALAR];
    }
    function findScalarTagByTest({ atKey, directives, schema: schema2 }, value, token, onError) {
      const tag = schema2.tags.find((tag2) => (tag2.default === true || atKey && tag2.default === "key") && tag2.test?.test(value)) || schema2[identity.SCALAR];
      if (schema2.compat) {
        const compat = schema2.compat.find((tag2) => tag2.default && tag2.test?.test(value)) ?? schema2[identity.SCALAR];
        if (tag.tag !== compat.tag) {
          const ts = directives.tagString(tag.tag);
          const cs = directives.tagString(compat.tag);
          const msg = `Value may be parsed as either ${ts} or ${cs}`;
          onError(token, "TAG_RESOLVE_FAILED", msg, true);
        }
      }
      return tag;
    }
    exports2.composeScalar = composeScalar;
  }
});

// node_modules/yaml/dist/compose/util-empty-scalar-position.js
var require_util_empty_scalar_position = __commonJS({
  "node_modules/yaml/dist/compose/util-empty-scalar-position.js"(exports2) {
    "use strict";
    function emptyScalarPosition(offset, before, pos) {
      if (before) {
        pos ?? (pos = before.length);
        for (let i = pos - 1; i >= 0; --i) {
          let st = before[i];
          switch (st.type) {
            case "space":
            case "comment":
            case "newline":
              offset -= st.source.length;
              continue;
          }
          st = before[++i];
          while (st?.type === "space") {
            offset += st.source.length;
            st = before[++i];
          }
          break;
        }
      }
      return offset;
    }
    exports2.emptyScalarPosition = emptyScalarPosition;
  }
});

// node_modules/yaml/dist/compose/compose-node.js
var require_compose_node = __commonJS({
  "node_modules/yaml/dist/compose/compose-node.js"(exports2) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var composeCollection = require_compose_collection();
    var composeScalar = require_compose_scalar();
    var resolveEnd = require_resolve_end();
    var utilEmptyScalarPosition = require_util_empty_scalar_position();
    var CN = { composeNode, composeEmptyNode };
    function composeNode(ctx, token, props, onError) {
      const atKey = ctx.atKey;
      const { spaceBefore, comment, anchor, tag } = props;
      let node;
      let isSrcToken = true;
      switch (token.type) {
        case "alias":
          node = composeAlias(ctx, token, onError);
          if (anchor || tag)
            onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
          break;
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "block-scalar":
          node = composeScalar.composeScalar(ctx, token, tag, onError);
          if (anchor)
            node.anchor = anchor.source.substring(1);
          break;
        case "block-map":
        case "block-seq":
        case "flow-collection":
          node = composeCollection.composeCollection(CN, ctx, token, props, onError);
          if (anchor)
            node.anchor = anchor.source.substring(1);
          break;
        default: {
          const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
          onError(token, "UNEXPECTED_TOKEN", message);
          node = composeEmptyNode(ctx, token.offset, void 0, null, props, onError);
          isSrcToken = false;
        }
      }
      if (anchor && node.anchor === "")
        onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      if (atKey && ctx.options.stringKeys && (!identity.isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
        const msg = "With stringKeys, all keys must be strings";
        onError(tag ?? token, "NON_STRING_KEY", msg);
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        if (token.type === "scalar" && token.source === "")
          node.comment = comment;
        else
          node.commentBefore = comment;
      }
      if (ctx.options.keepSourceTokens && isSrcToken)
        node.srcToken = token;
      return node;
    }
    function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
      const token = {
        type: "scalar",
        offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
        indent: -1,
        source: ""
      };
      const node = composeScalar.composeScalar(ctx, token, tag, onError);
      if (anchor) {
        node.anchor = anchor.source.substring(1);
        if (node.anchor === "")
          onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        node.comment = comment;
        node.range[2] = end;
      }
      return node;
    }
    function composeAlias({ options }, { offset, source, end }, onError) {
      const alias = new Alias.Alias(source.substring(1));
      if (alias.source === "")
        onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
      if (alias.source.endsWith(":"))
        onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, options.strict, onError);
      alias.range = [offset, valueEnd, re.offset];
      if (re.comment)
        alias.comment = re.comment;
      return alias;
    }
    exports2.composeEmptyNode = composeEmptyNode;
    exports2.composeNode = composeNode;
  }
});

// node_modules/yaml/dist/compose/compose-doc.js
var require_compose_doc = __commonJS({
  "node_modules/yaml/dist/compose/compose-doc.js"(exports2) {
    "use strict";
    var Document = require_Document();
    var composeNode = require_compose_node();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    function composeDoc(options, directives, { offset, start, value, end }, onError) {
      const opts = Object.assign({ _directives: directives }, options);
      const doc = new Document.Document(void 0, opts);
      const ctx = {
        atKey: false,
        atRoot: true,
        directives: doc.directives,
        options: doc.options,
        schema: doc.schema
      };
      const props = resolveProps.resolveProps(start, {
        indicator: "doc-start",
        next: value ?? end?.[0],
        offset,
        onError,
        parentIndent: 0,
        startOnNewline: true
      });
      if (props.found) {
        doc.directives.docStart = true;
        if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
          onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
      }
      doc.contents = value ? composeNode.composeNode(ctx, value, props, onError) : composeNode.composeEmptyNode(ctx, props.end, start, null, props, onError);
      const contentEnd = doc.contents.range[2];
      const re = resolveEnd.resolveEnd(end, contentEnd, false, onError);
      if (re.comment)
        doc.comment = re.comment;
      doc.range = [offset, contentEnd, re.offset];
      return doc;
    }
    exports2.composeDoc = composeDoc;
  }
});

// node_modules/yaml/dist/compose/composer.js
var require_composer = __commonJS({
  "node_modules/yaml/dist/compose/composer.js"(exports2) {
    "use strict";
    var node_process = require("process");
    var directives = require_directives();
    var Document = require_Document();
    var errors = require_errors();
    var identity = require_identity();
    var composeDoc = require_compose_doc();
    var resolveEnd = require_resolve_end();
    function getErrorPos(src) {
      if (typeof src === "number")
        return [src, src + 1];
      if (Array.isArray(src))
        return src.length === 2 ? src : [src[0], src[1]];
      const { offset, source } = src;
      return [offset, offset + (typeof source === "string" ? source.length : 1)];
    }
    function parsePrelude(prelude) {
      let comment = "";
      let atComment = false;
      let afterEmptyLine = false;
      for (let i = 0; i < prelude.length; ++i) {
        const source = prelude[i];
        switch (source[0]) {
          case "#":
            comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
            atComment = true;
            afterEmptyLine = false;
            break;
          case "%":
            if (prelude[i + 1]?.[0] !== "#")
              i += 1;
            atComment = false;
            break;
          default:
            if (!atComment)
              afterEmptyLine = true;
            atComment = false;
        }
      }
      return { comment, afterEmptyLine };
    }
    var Composer = class {
      constructor(options = {}) {
        this.doc = null;
        this.atDirectives = false;
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
        this.onError = (source, code, message, warning) => {
          const pos = getErrorPos(source);
          if (warning)
            this.warnings.push(new errors.YAMLWarning(pos, code, message));
          else
            this.errors.push(new errors.YAMLParseError(pos, code, message));
        };
        this.directives = new directives.Directives({ version: options.version || "1.2" });
        this.options = options;
      }
      decorate(doc, afterDoc) {
        const { comment, afterEmptyLine } = parsePrelude(this.prelude);
        if (comment) {
          const dc = doc.contents;
          if (afterDoc) {
            doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
          } else if (afterEmptyLine || doc.directives.docStart || !dc) {
            doc.commentBefore = comment;
          } else if (identity.isCollection(dc) && !dc.flow && dc.items.length > 0) {
            let it = dc.items[0];
            if (identity.isPair(it))
              it = it.key;
            const cb = it.commentBefore;
            it.commentBefore = cb ? `${comment}
${cb}` : comment;
          } else {
            const cb = dc.commentBefore;
            dc.commentBefore = cb ? `${comment}
${cb}` : comment;
          }
        }
        if (afterDoc) {
          Array.prototype.push.apply(doc.errors, this.errors);
          Array.prototype.push.apply(doc.warnings, this.warnings);
        } else {
          doc.errors = this.errors;
          doc.warnings = this.warnings;
        }
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
      }
      /**
       * Current stream status information.
       *
       * Mostly useful at the end of input for an empty stream.
       */
      streamInfo() {
        return {
          comment: parsePrelude(this.prelude).comment,
          directives: this.directives,
          errors: this.errors,
          warnings: this.warnings
        };
      }
      /**
       * Compose tokens into documents.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *compose(tokens, forceDoc = false, endOffset = -1) {
        for (const token of tokens)
          yield* this.next(token);
        yield* this.end(forceDoc, endOffset);
      }
      /** Advance the composer by one CST token. */
      *next(token) {
        if (node_process.env.LOG_STREAM)
          console.dir(token, { depth: null });
        switch (token.type) {
          case "directive":
            this.directives.add(token.source, (offset, message, warning) => {
              const pos = getErrorPos(token);
              pos[0] += offset;
              this.onError(pos, "BAD_DIRECTIVE", message, warning);
            });
            this.prelude.push(token.source);
            this.atDirectives = true;
            break;
          case "document": {
            const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
            if (this.atDirectives && !doc.directives.docStart)
              this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
            this.decorate(doc, false);
            if (this.doc)
              yield this.doc;
            this.doc = doc;
            this.atDirectives = false;
            break;
          }
          case "byte-order-mark":
          case "space":
            break;
          case "comment":
          case "newline":
            this.prelude.push(token.source);
            break;
          case "error": {
            const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
            const error = new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
            if (this.atDirectives || !this.doc)
              this.errors.push(error);
            else
              this.doc.errors.push(error);
            break;
          }
          case "doc-end": {
            if (!this.doc) {
              const msg = "Unexpected doc-end without preceding document";
              this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
              break;
            }
            this.doc.directives.docEnd = true;
            const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
            this.decorate(this.doc, true);
            if (end.comment) {
              const dc = this.doc.comment;
              this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
            }
            this.doc.range[2] = end.offset;
            break;
          }
          default:
            this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
        }
      }
      /**
       * Call at end of input to yield any remaining document.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *end(forceDoc = false, endOffset = -1) {
        if (this.doc) {
          this.decorate(this.doc, true);
          yield this.doc;
          this.doc = null;
        } else if (forceDoc) {
          const opts = Object.assign({ _directives: this.directives }, this.options);
          const doc = new Document.Document(void 0, opts);
          if (this.atDirectives)
            this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
          doc.range = [0, endOffset, endOffset];
          this.decorate(doc, false);
          yield doc;
        }
      }
    };
    exports2.Composer = Composer;
  }
});

// node_modules/yaml/dist/parse/cst-scalar.js
var require_cst_scalar = __commonJS({
  "node_modules/yaml/dist/parse/cst-scalar.js"(exports2) {
    "use strict";
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    var errors = require_errors();
    var stringifyString = require_stringifyString();
    function resolveAsScalar(token, strict = true, onError) {
      if (token) {
        const _onError = (pos, code, message) => {
          const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
          if (onError)
            onError(offset, code, message);
          else
            throw new errors.YAMLParseError([offset, offset + 1], code, message);
        };
        switch (token.type) {
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
          case "block-scalar":
            return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
        }
      }
      return null;
    }
    function createScalarToken(value, context) {
      const { implicitKey = false, indent, inFlow = false, offset = -1, type = "PLAIN" } = context;
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey,
        indent: indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      const end = context.end ?? [
        { type: "newline", offset: -1, indent, source: "\n" }
      ];
      switch (source[0]) {
        case "|":
        case ">": {
          const he = source.indexOf("\n");
          const head = source.substring(0, he);
          const body = source.substring(he + 1) + "\n";
          const props = [
            { type: "block-scalar-header", offset, indent, source: head }
          ];
          if (!addEndtoBlockProps(props, end))
            props.push({ type: "newline", offset: -1, indent, source: "\n" });
          return { type: "block-scalar", offset, indent, props, source: body };
        }
        case '"':
          return { type: "double-quoted-scalar", offset, indent, source, end };
        case "'":
          return { type: "single-quoted-scalar", offset, indent, source, end };
        default:
          return { type: "scalar", offset, indent, source, end };
      }
    }
    function setScalarValue(token, value, context = {}) {
      let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
      let indent = "indent" in token ? token.indent : null;
      if (afterKey && typeof indent === "number")
        indent += 2;
      if (!type)
        switch (token.type) {
          case "single-quoted-scalar":
            type = "QUOTE_SINGLE";
            break;
          case "double-quoted-scalar":
            type = "QUOTE_DOUBLE";
            break;
          case "block-scalar": {
            const header = token.props[0];
            if (header.type !== "block-scalar-header")
              throw new Error("Invalid block scalar header");
            type = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
            break;
          }
          default:
            type = "PLAIN";
        }
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey: implicitKey || indent === null,
        indent: indent !== null && indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      switch (source[0]) {
        case "|":
        case ">":
          setBlockScalarValue(token, source);
          break;
        case '"':
          setFlowScalarValue(token, source, "double-quoted-scalar");
          break;
        case "'":
          setFlowScalarValue(token, source, "single-quoted-scalar");
          break;
        default:
          setFlowScalarValue(token, source, "scalar");
      }
    }
    function setBlockScalarValue(token, source) {
      const he = source.indexOf("\n");
      const head = source.substring(0, he);
      const body = source.substring(he + 1) + "\n";
      if (token.type === "block-scalar") {
        const header = token.props[0];
        if (header.type !== "block-scalar-header")
          throw new Error("Invalid block scalar header");
        header.source = head;
        token.source = body;
      } else {
        const { offset } = token;
        const indent = "indent" in token ? token.indent : -1;
        const props = [
          { type: "block-scalar-header", offset, indent, source: head }
        ];
        if (!addEndtoBlockProps(props, "end" in token ? token.end : void 0))
          props.push({ type: "newline", offset: -1, indent, source: "\n" });
        for (const key of Object.keys(token))
          if (key !== "type" && key !== "offset")
            delete token[key];
        Object.assign(token, { type: "block-scalar", indent, props, source: body });
      }
    }
    function addEndtoBlockProps(props, end) {
      if (end)
        for (const st of end)
          switch (st.type) {
            case "space":
            case "comment":
              props.push(st);
              break;
            case "newline":
              props.push(st);
              return true;
          }
      return false;
    }
    function setFlowScalarValue(token, source, type) {
      switch (token.type) {
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          token.type = type;
          token.source = source;
          break;
        case "block-scalar": {
          const end = token.props.slice(1);
          let oa = source.length;
          if (token.props[0].type === "block-scalar-header")
            oa -= token.props[0].source.length;
          for (const tok of end)
            tok.offset += oa;
          delete token.props;
          Object.assign(token, { type, source, end });
          break;
        }
        case "block-map":
        case "block-seq": {
          const offset = token.offset + source.length;
          const nl = { type: "newline", offset, indent: token.indent, source: "\n" };
          delete token.items;
          Object.assign(token, { type, source, end: [nl] });
          break;
        }
        default: {
          const indent = "indent" in token ? token.indent : -1;
          const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
          for (const key of Object.keys(token))
            if (key !== "type" && key !== "offset")
              delete token[key];
          Object.assign(token, { type, indent, source, end });
        }
      }
    }
    exports2.createScalarToken = createScalarToken;
    exports2.resolveAsScalar = resolveAsScalar;
    exports2.setScalarValue = setScalarValue;
  }
});

// node_modules/yaml/dist/parse/cst-stringify.js
var require_cst_stringify = __commonJS({
  "node_modules/yaml/dist/parse/cst-stringify.js"(exports2) {
    "use strict";
    var stringify = (cst) => "type" in cst ? stringifyToken(cst) : stringifyItem(cst);
    function stringifyToken(token) {
      switch (token.type) {
        case "block-scalar": {
          let res = "";
          for (const tok of token.props)
            res += stringifyToken(tok);
          return res + token.source;
        }
        case "block-map":
        case "block-seq": {
          let res = "";
          for (const item of token.items)
            res += stringifyItem(item);
          return res;
        }
        case "flow-collection": {
          let res = token.start.source;
          for (const item of token.items)
            res += stringifyItem(item);
          for (const st of token.end)
            res += st.source;
          return res;
        }
        case "document": {
          let res = stringifyItem(token);
          if (token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
        default: {
          let res = token.source;
          if ("end" in token && token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
      }
    }
    function stringifyItem({ start, key, sep, value }) {
      let res = "";
      for (const st of start)
        res += st.source;
      if (key)
        res += stringifyToken(key);
      if (sep)
        for (const st of sep)
          res += st.source;
      if (value)
        res += stringifyToken(value);
      return res;
    }
    exports2.stringify = stringify;
  }
});

// node_modules/yaml/dist/parse/cst-visit.js
var require_cst_visit = __commonJS({
  "node_modules/yaml/dist/parse/cst-visit.js"(exports2) {
    "use strict";
    var BREAK = Symbol("break visit");
    var SKIP = Symbol("skip children");
    var REMOVE = Symbol("remove item");
    function visit2(cst, visitor) {
      if ("type" in cst && cst.type === "document")
        cst = { start: cst.start, value: cst.value };
      _visit(Object.freeze([]), cst, visitor);
    }
    visit2.BREAK = BREAK;
    visit2.SKIP = SKIP;
    visit2.REMOVE = REMOVE;
    visit2.itemAtPath = (cst, path20) => {
      let item = cst;
      for (const [field, index] of path20) {
        const tok = item?.[field];
        if (tok && "items" in tok) {
          item = tok.items[index];
        } else
          return void 0;
      }
      return item;
    };
    visit2.parentCollection = (cst, path20) => {
      const parent = visit2.itemAtPath(cst, path20.slice(0, -1));
      const field = path20[path20.length - 1][0];
      const coll = parent?.[field];
      if (coll && "items" in coll)
        return coll;
      throw new Error("Parent collection not found");
    };
    function _visit(path20, item, visitor) {
      let ctrl = visitor(item, path20);
      if (typeof ctrl === "symbol")
        return ctrl;
      for (const field of ["key", "value"]) {
        const token = item[field];
        if (token && "items" in token) {
          for (let i = 0; i < token.items.length; ++i) {
            const ci = _visit(Object.freeze(path20.concat([[field, i]])), token.items[i], visitor);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              token.items.splice(i, 1);
              i -= 1;
            }
          }
          if (typeof ctrl === "function" && field === "key")
            ctrl = ctrl(item, path20);
        }
      }
      return typeof ctrl === "function" ? ctrl(item, path20) : ctrl;
    }
    exports2.visit = visit2;
  }
});

// node_modules/yaml/dist/parse/cst.js
var require_cst = __commonJS({
  "node_modules/yaml/dist/parse/cst.js"(exports2) {
    "use strict";
    var cstScalar = require_cst_scalar();
    var cstStringify = require_cst_stringify();
    var cstVisit = require_cst_visit();
    var BOM = "\uFEFF";
    var DOCUMENT = "";
    var FLOW_END = "";
    var SCALAR = "";
    var isCollection = (token) => !!token && "items" in token;
    var isScalar = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
    function prettyToken(token) {
      switch (token) {
        case BOM:
          return "<BOM>";
        case DOCUMENT:
          return "<DOC>";
        case FLOW_END:
          return "<FLOW_END>";
        case SCALAR:
          return "<SCALAR>";
        default:
          return JSON.stringify(token);
      }
    }
    function tokenType(source) {
      switch (source) {
        case BOM:
          return "byte-order-mark";
        case DOCUMENT:
          return "doc-mode";
        case FLOW_END:
          return "flow-error-end";
        case SCALAR:
          return "scalar";
        case "---":
          return "doc-start";
        case "...":
          return "doc-end";
        case "":
        case "\n":
        case "\r\n":
          return "newline";
        case "-":
          return "seq-item-ind";
        case "?":
          return "explicit-key-ind";
        case ":":
          return "map-value-ind";
        case "{":
          return "flow-map-start";
        case "}":
          return "flow-map-end";
        case "[":
          return "flow-seq-start";
        case "]":
          return "flow-seq-end";
        case ",":
          return "comma";
      }
      switch (source[0]) {
        case " ":
        case "	":
          return "space";
        case "#":
          return "comment";
        case "%":
          return "directive-line";
        case "*":
          return "alias";
        case "&":
          return "anchor";
        case "!":
          return "tag";
        case "'":
          return "single-quoted-scalar";
        case '"':
          return "double-quoted-scalar";
        case "|":
        case ">":
          return "block-scalar-header";
      }
      return null;
    }
    exports2.createScalarToken = cstScalar.createScalarToken;
    exports2.resolveAsScalar = cstScalar.resolveAsScalar;
    exports2.setScalarValue = cstScalar.setScalarValue;
    exports2.stringify = cstStringify.stringify;
    exports2.visit = cstVisit.visit;
    exports2.BOM = BOM;
    exports2.DOCUMENT = DOCUMENT;
    exports2.FLOW_END = FLOW_END;
    exports2.SCALAR = SCALAR;
    exports2.isCollection = isCollection;
    exports2.isScalar = isScalar;
    exports2.prettyToken = prettyToken;
    exports2.tokenType = tokenType;
  }
});

// node_modules/yaml/dist/parse/lexer.js
var require_lexer = __commonJS({
  "node_modules/yaml/dist/parse/lexer.js"(exports2) {
    "use strict";
    var cst = require_cst();
    function isEmpty(ch) {
      switch (ch) {
        case void 0:
        case " ":
        case "\n":
        case "\r":
        case "	":
          return true;
        default:
          return false;
      }
    }
    var hexDigits = new Set("0123456789ABCDEFabcdef");
    var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
    var flowIndicatorChars = new Set(",[]{}");
    var invalidAnchorChars = new Set(" ,[]{}\n\r	");
    var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
    var Lexer = class {
      constructor() {
        this.atEnd = false;
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        this.buffer = "";
        this.flowKey = false;
        this.flowLevel = 0;
        this.indentNext = 0;
        this.indentValue = 0;
        this.lineEndPos = null;
        this.next = null;
        this.pos = 0;
      }
      /**
       * Generate YAML tokens from the `source` string. If `incomplete`,
       * a part of the last line may be left as a buffer for the next call.
       *
       * @returns A generator of lexical tokens
       */
      *lex(source, incomplete = false) {
        if (source) {
          if (typeof source !== "string")
            throw TypeError("source is not a string");
          this.buffer = this.buffer ? this.buffer + source : source;
          this.lineEndPos = null;
        }
        this.atEnd = !incomplete;
        let next = this.next ?? "stream";
        while (next && (incomplete || this.hasChars(1)))
          next = yield* this.parseNext(next);
      }
      atLineEnd() {
        let i = this.pos;
        let ch = this.buffer[i];
        while (ch === " " || ch === "	")
          ch = this.buffer[++i];
        if (!ch || ch === "#" || ch === "\n")
          return true;
        if (ch === "\r")
          return this.buffer[i + 1] === "\n";
        return false;
      }
      charAt(n) {
        return this.buffer[this.pos + n];
      }
      continueScalar(offset) {
        let ch = this.buffer[offset];
        if (this.indentNext > 0) {
          let indent = 0;
          while (ch === " ")
            ch = this.buffer[++indent + offset];
          if (ch === "\r") {
            const next = this.buffer[indent + offset + 1];
            if (next === "\n" || !next && !this.atEnd)
              return offset + indent + 1;
          }
          return ch === "\n" || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
        }
        if (ch === "-" || ch === ".") {
          const dt = this.buffer.substr(offset, 3);
          if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
            return -1;
        }
        return offset;
      }
      getLine() {
        let end = this.lineEndPos;
        if (typeof end !== "number" || end !== -1 && end < this.pos) {
          end = this.buffer.indexOf("\n", this.pos);
          this.lineEndPos = end;
        }
        if (end === -1)
          return this.atEnd ? this.buffer.substring(this.pos) : null;
        if (this.buffer[end - 1] === "\r")
          end -= 1;
        return this.buffer.substring(this.pos, end);
      }
      hasChars(n) {
        return this.pos + n <= this.buffer.length;
      }
      setNext(state) {
        this.buffer = this.buffer.substring(this.pos);
        this.pos = 0;
        this.lineEndPos = null;
        this.next = state;
        return null;
      }
      peek(n) {
        return this.buffer.substr(this.pos, n);
      }
      *parseNext(next) {
        switch (next) {
          case "stream":
            return yield* this.parseStream();
          case "line-start":
            return yield* this.parseLineStart();
          case "block-start":
            return yield* this.parseBlockStart();
          case "doc":
            return yield* this.parseDocument();
          case "flow":
            return yield* this.parseFlowCollection();
          case "quoted-scalar":
            return yield* this.parseQuotedScalar();
          case "block-scalar":
            return yield* this.parseBlockScalar();
          case "plain-scalar":
            return yield* this.parsePlainScalar();
        }
      }
      *parseStream() {
        let line = this.getLine();
        if (line === null)
          return this.setNext("stream");
        if (line[0] === cst.BOM) {
          yield* this.pushCount(1);
          line = line.substring(1);
        }
        if (line[0] === "%") {
          let dirEnd = line.length;
          let cs = line.indexOf("#");
          while (cs !== -1) {
            const ch = line[cs - 1];
            if (ch === " " || ch === "	") {
              dirEnd = cs - 1;
              break;
            } else {
              cs = line.indexOf("#", cs + 1);
            }
          }
          while (true) {
            const ch = line[dirEnd - 1];
            if (ch === " " || ch === "	")
              dirEnd -= 1;
            else
              break;
          }
          const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
          yield* this.pushCount(line.length - n);
          this.pushNewline();
          return "stream";
        }
        if (this.atLineEnd()) {
          const sp = yield* this.pushSpaces(true);
          yield* this.pushCount(line.length - sp);
          yield* this.pushNewline();
          return "stream";
        }
        yield cst.DOCUMENT;
        return yield* this.parseLineStart();
      }
      *parseLineStart() {
        const ch = this.charAt(0);
        if (!ch && !this.atEnd)
          return this.setNext("line-start");
        if (ch === "-" || ch === ".") {
          if (!this.atEnd && !this.hasChars(4))
            return this.setNext("line-start");
          const s = this.peek(3);
          if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
            yield* this.pushCount(3);
            this.indentValue = 0;
            this.indentNext = 0;
            return s === "---" ? "doc" : "stream";
          }
        }
        this.indentValue = yield* this.pushSpaces(false);
        if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
          this.indentNext = this.indentValue;
        return yield* this.parseBlockStart();
      }
      *parseBlockStart() {
        const [ch0, ch1] = this.peek(2);
        if (!ch1 && !this.atEnd)
          return this.setNext("block-start");
        if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
          const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
          this.indentNext = this.indentValue + 1;
          this.indentValue += n;
          return yield* this.parseBlockStart();
        }
        return "doc";
      }
      *parseDocument() {
        yield* this.pushSpaces(true);
        const line = this.getLine();
        if (line === null)
          return this.setNext("doc");
        let n = yield* this.pushIndicators();
        switch (line[n]) {
          case "#":
            yield* this.pushCount(line.length - n);
          // fallthrough
          case void 0:
            yield* this.pushNewline();
            return yield* this.parseLineStart();
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel = 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            return "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "doc";
          case '"':
          case "'":
            return yield* this.parseQuotedScalar();
          case "|":
          case ">":
            n += yield* this.parseBlockScalarHeader();
            n += yield* this.pushSpaces(true);
            yield* this.pushCount(line.length - n);
            yield* this.pushNewline();
            return yield* this.parseBlockScalar();
          default:
            return yield* this.parsePlainScalar();
        }
      }
      *parseFlowCollection() {
        let nl, sp;
        let indent = -1;
        do {
          nl = yield* this.pushNewline();
          if (nl > 0) {
            sp = yield* this.pushSpaces(false);
            this.indentValue = indent = sp;
          } else {
            sp = 0;
          }
          sp += yield* this.pushSpaces(true);
        } while (nl + sp > 0);
        const line = this.getLine();
        if (line === null)
          return this.setNext("flow");
        if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
          const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
          if (!atFlowEndMarker) {
            this.flowLevel = 0;
            yield cst.FLOW_END;
            return yield* this.parseLineStart();
          }
        }
        let n = 0;
        while (line[n] === ",") {
          n += yield* this.pushCount(1);
          n += yield* this.pushSpaces(true);
          this.flowKey = false;
        }
        n += yield* this.pushIndicators();
        switch (line[n]) {
          case void 0:
            return "flow";
          case "#":
            yield* this.pushCount(line.length - n);
            return "flow";
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel += 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            this.flowKey = true;
            this.flowLevel -= 1;
            return this.flowLevel ? "flow" : "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "flow";
          case '"':
          case "'":
            this.flowKey = true;
            return yield* this.parseQuotedScalar();
          case ":": {
            const next = this.charAt(1);
            if (this.flowKey || isEmpty(next) || next === ",") {
              this.flowKey = false;
              yield* this.pushCount(1);
              yield* this.pushSpaces(true);
              return "flow";
            }
          }
          // fallthrough
          default:
            this.flowKey = false;
            return yield* this.parsePlainScalar();
        }
      }
      *parseQuotedScalar() {
        const quote = this.charAt(0);
        let end = this.buffer.indexOf(quote, this.pos + 1);
        if (quote === "'") {
          while (end !== -1 && this.buffer[end + 1] === "'")
            end = this.buffer.indexOf("'", end + 2);
        } else {
          while (end !== -1) {
            let n = 0;
            while (this.buffer[end - 1 - n] === "\\")
              n += 1;
            if (n % 2 === 0)
              break;
            end = this.buffer.indexOf('"', end + 1);
          }
        }
        const qb = this.buffer.substring(0, end);
        let nl = qb.indexOf("\n", this.pos);
        if (nl !== -1) {
          while (nl !== -1) {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = qb.indexOf("\n", cs);
          }
          if (nl !== -1) {
            end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
          }
        }
        if (end === -1) {
          if (!this.atEnd)
            return this.setNext("quoted-scalar");
          end = this.buffer.length;
        }
        yield* this.pushToIndex(end + 1, false);
        return this.flowLevel ? "flow" : "doc";
      }
      *parseBlockScalarHeader() {
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        let i = this.pos;
        while (true) {
          const ch = this.buffer[++i];
          if (ch === "+")
            this.blockScalarKeep = true;
          else if (ch > "0" && ch <= "9")
            this.blockScalarIndent = Number(ch) - 1;
          else if (ch !== "-")
            break;
        }
        return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
      }
      *parseBlockScalar() {
        let nl = this.pos - 1;
        let indent = 0;
        let ch;
        loop: for (let i2 = this.pos; ch = this.buffer[i2]; ++i2) {
          switch (ch) {
            case " ":
              indent += 1;
              break;
            case "\n":
              nl = i2;
              indent = 0;
              break;
            case "\r": {
              const next = this.buffer[i2 + 1];
              if (!next && !this.atEnd)
                return this.setNext("block-scalar");
              if (next === "\n")
                break;
            }
            // fallthrough
            default:
              break loop;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("block-scalar");
        if (indent >= this.indentNext) {
          if (this.blockScalarIndent === -1)
            this.indentNext = indent;
          else {
            this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
          }
          do {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = this.buffer.indexOf("\n", cs);
          } while (nl !== -1);
          if (nl === -1) {
            if (!this.atEnd)
              return this.setNext("block-scalar");
            nl = this.buffer.length;
          }
        }
        let i = nl + 1;
        ch = this.buffer[i];
        while (ch === " ")
          ch = this.buffer[++i];
        if (ch === "	") {
          while (ch === "	" || ch === " " || ch === "\r" || ch === "\n")
            ch = this.buffer[++i];
          nl = i - 1;
        } else if (!this.blockScalarKeep) {
          do {
            let i2 = nl - 1;
            let ch2 = this.buffer[i2];
            if (ch2 === "\r")
              ch2 = this.buffer[--i2];
            const lastChar = i2;
            while (ch2 === " ")
              ch2 = this.buffer[--i2];
            if (ch2 === "\n" && i2 >= this.pos && i2 + 1 + indent > lastChar)
              nl = i2;
            else
              break;
          } while (true);
        }
        yield cst.SCALAR;
        yield* this.pushToIndex(nl + 1, true);
        return yield* this.parseLineStart();
      }
      *parsePlainScalar() {
        const inFlow = this.flowLevel > 0;
        let end = this.pos - 1;
        let i = this.pos - 1;
        let ch;
        while (ch = this.buffer[++i]) {
          if (ch === ":") {
            const next = this.buffer[i + 1];
            if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
              break;
            end = i;
          } else if (isEmpty(ch)) {
            let next = this.buffer[i + 1];
            if (ch === "\r") {
              if (next === "\n") {
                i += 1;
                ch = "\n";
                next = this.buffer[i + 1];
              } else
                end = i;
            }
            if (next === "#" || inFlow && flowIndicatorChars.has(next))
              break;
            if (ch === "\n") {
              const cs = this.continueScalar(i + 1);
              if (cs === -1)
                break;
              i = Math.max(i, cs - 2);
            }
          } else {
            if (inFlow && flowIndicatorChars.has(ch))
              break;
            end = i;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("plain-scalar");
        yield cst.SCALAR;
        yield* this.pushToIndex(end + 1, true);
        return inFlow ? "flow" : "doc";
      }
      *pushCount(n) {
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos += n;
          return n;
        }
        return 0;
      }
      *pushToIndex(i, allowEmpty) {
        const s = this.buffer.slice(this.pos, i);
        if (s) {
          yield s;
          this.pos += s.length;
          return s.length;
        } else if (allowEmpty)
          yield "";
        return 0;
      }
      *pushIndicators() {
        switch (this.charAt(0)) {
          case "!":
            return (yield* this.pushTag()) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
          case "&":
            return (yield* this.pushUntil(isNotAnchorChar)) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
          case "-":
          // this is an error
          case "?":
          // this is an error outside flow collections
          case ":": {
            const inFlow = this.flowLevel > 0;
            const ch1 = this.charAt(1);
            if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
              if (!inFlow)
                this.indentNext = this.indentValue + 1;
              else if (this.flowKey)
                this.flowKey = false;
              return (yield* this.pushCount(1)) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
            }
          }
        }
        return 0;
      }
      *pushTag() {
        if (this.charAt(1) === "<") {
          let i = this.pos + 2;
          let ch = this.buffer[i];
          while (!isEmpty(ch) && ch !== ">")
            ch = this.buffer[++i];
          return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
        } else {
          let i = this.pos + 1;
          let ch = this.buffer[i];
          while (ch) {
            if (tagChars.has(ch))
              ch = this.buffer[++i];
            else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) {
              ch = this.buffer[i += 3];
            } else
              break;
          }
          return yield* this.pushToIndex(i, false);
        }
      }
      *pushNewline() {
        const ch = this.buffer[this.pos];
        if (ch === "\n")
          return yield* this.pushCount(1);
        else if (ch === "\r" && this.charAt(1) === "\n")
          return yield* this.pushCount(2);
        else
          return 0;
      }
      *pushSpaces(allowTabs) {
        let i = this.pos - 1;
        let ch;
        do {
          ch = this.buffer[++i];
        } while (ch === " " || allowTabs && ch === "	");
        const n = i - this.pos;
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos = i;
        }
        return n;
      }
      *pushUntil(test7) {
        let i = this.pos;
        let ch = this.buffer[i];
        while (!test7(ch))
          ch = this.buffer[++i];
        return yield* this.pushToIndex(i, false);
      }
    };
    exports2.Lexer = Lexer;
  }
});

// node_modules/yaml/dist/parse/line-counter.js
var require_line_counter = __commonJS({
  "node_modules/yaml/dist/parse/line-counter.js"(exports2) {
    "use strict";
    var LineCounter = class {
      constructor() {
        this.lineStarts = [];
        this.addNewLine = (offset) => this.lineStarts.push(offset);
        this.linePos = (offset) => {
          let low = 0;
          let high = this.lineStarts.length;
          while (low < high) {
            const mid = low + high >> 1;
            if (this.lineStarts[mid] < offset)
              low = mid + 1;
            else
              high = mid;
          }
          if (this.lineStarts[low] === offset)
            return { line: low + 1, col: 1 };
          if (low === 0)
            return { line: 0, col: offset };
          const start = this.lineStarts[low - 1];
          return { line: low, col: offset - start + 1 };
        };
      }
    };
    exports2.LineCounter = LineCounter;
  }
});

// node_modules/yaml/dist/parse/parser.js
var require_parser = __commonJS({
  "node_modules/yaml/dist/parse/parser.js"(exports2) {
    "use strict";
    var node_process = require("process");
    var cst = require_cst();
    var lexer = require_lexer();
    function includesToken(list, type) {
      for (let i = 0; i < list.length; ++i)
        if (list[i].type === type)
          return true;
      return false;
    }
    function findNonEmptyIndex(list) {
      for (let i = 0; i < list.length; ++i) {
        switch (list[i].type) {
          case "space":
          case "comment":
          case "newline":
            break;
          default:
            return i;
        }
      }
      return -1;
    }
    function isFlowToken(token) {
      switch (token?.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "flow-collection":
          return true;
        default:
          return false;
      }
    }
    function getPrevProps(parent) {
      switch (parent.type) {
        case "document":
          return parent.start;
        case "block-map": {
          const it = parent.items[parent.items.length - 1];
          return it.sep ?? it.start;
        }
        case "block-seq":
          return parent.items[parent.items.length - 1].start;
        /* istanbul ignore next should not happen */
        default:
          return [];
      }
    }
    function getFirstKeyStartProps(prev) {
      if (prev.length === 0)
        return [];
      let i = prev.length;
      loop: while (--i >= 0) {
        switch (prev[i].type) {
          case "doc-start":
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
          case "newline":
            break loop;
        }
      }
      while (prev[++i]?.type === "space") {
      }
      return prev.splice(i, prev.length);
    }
    function fixFlowSeqItems(fc) {
      if (fc.start.type === "flow-seq-start") {
        for (const it of fc.items) {
          if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
            if (it.key)
              it.value = it.key;
            delete it.key;
            if (isFlowToken(it.value)) {
              if (it.value.end)
                Array.prototype.push.apply(it.value.end, it.sep);
              else
                it.value.end = it.sep;
            } else
              Array.prototype.push.apply(it.start, it.sep);
            delete it.sep;
          }
        }
      }
    }
    var Parser = class {
      /**
       * @param onNewLine - If defined, called separately with the start position of
       *   each new line (in `parse()`, including the start of input).
       */
      constructor(onNewLine) {
        this.atNewLine = true;
        this.atScalar = false;
        this.indent = 0;
        this.offset = 0;
        this.onKeyLine = false;
        this.stack = [];
        this.source = "";
        this.type = "";
        this.lexer = new lexer.Lexer();
        this.onNewLine = onNewLine;
      }
      /**
       * Parse `source` as a YAML stream.
       * If `incomplete`, a part of the last line may be left as a buffer for the next call.
       *
       * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
       *
       * @returns A generator of tokens representing each directive, document, and other structure.
       */
      *parse(source, incomplete = false) {
        if (this.onNewLine && this.offset === 0)
          this.onNewLine(0);
        for (const lexeme of this.lexer.lex(source, incomplete))
          yield* this.next(lexeme);
        if (!incomplete)
          yield* this.end();
      }
      /**
       * Advance the parser by the `source` of one lexical token.
       */
      *next(source) {
        this.source = source;
        if (node_process.env.LOG_TOKENS)
          console.log("|", cst.prettyToken(source));
        if (this.atScalar) {
          this.atScalar = false;
          yield* this.step();
          this.offset += source.length;
          return;
        }
        const type = cst.tokenType(source);
        if (!type) {
          const message = `Not a YAML token: ${source}`;
          yield* this.pop({ type: "error", offset: this.offset, message, source });
          this.offset += source.length;
        } else if (type === "scalar") {
          this.atNewLine = false;
          this.atScalar = true;
          this.type = "scalar";
        } else {
          this.type = type;
          yield* this.step();
          switch (type) {
            case "newline":
              this.atNewLine = true;
              this.indent = 0;
              if (this.onNewLine)
                this.onNewLine(this.offset + source.length);
              break;
            case "space":
              if (this.atNewLine && source[0] === " ")
                this.indent += source.length;
              break;
            case "explicit-key-ind":
            case "map-value-ind":
            case "seq-item-ind":
              if (this.atNewLine)
                this.indent += source.length;
              break;
            case "doc-mode":
            case "flow-error-end":
              return;
            default:
              this.atNewLine = false;
          }
          this.offset += source.length;
        }
      }
      /** Call at end of input to push out any remaining constructions */
      *end() {
        while (this.stack.length > 0)
          yield* this.pop();
      }
      get sourceToken() {
        const st = {
          type: this.type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
        return st;
      }
      *step() {
        const top = this.peek(1);
        if (this.type === "doc-end" && (!top || top.type !== "doc-end")) {
          while (this.stack.length > 0)
            yield* this.pop();
          this.stack.push({
            type: "doc-end",
            offset: this.offset,
            source: this.source
          });
          return;
        }
        if (!top)
          return yield* this.stream();
        switch (top.type) {
          case "document":
            return yield* this.document(top);
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return yield* this.scalar(top);
          case "block-scalar":
            return yield* this.blockScalar(top);
          case "block-map":
            return yield* this.blockMap(top);
          case "block-seq":
            return yield* this.blockSequence(top);
          case "flow-collection":
            return yield* this.flowCollection(top);
          case "doc-end":
            return yield* this.documentEnd(top);
        }
        yield* this.pop();
      }
      peek(n) {
        return this.stack[this.stack.length - n];
      }
      *pop(error) {
        const token = error ?? this.stack.pop();
        if (!token) {
          const message = "Tried to pop an empty stack";
          yield { type: "error", offset: this.offset, source: "", message };
        } else if (this.stack.length === 0) {
          yield token;
        } else {
          const top = this.peek(1);
          if (token.type === "block-scalar") {
            token.indent = "indent" in top ? top.indent : 0;
          } else if (token.type === "flow-collection" && top.type === "document") {
            token.indent = 0;
          }
          if (token.type === "flow-collection")
            fixFlowSeqItems(token);
          switch (top.type) {
            case "document":
              top.value = token;
              break;
            case "block-scalar":
              top.props.push(token);
              break;
            case "block-map": {
              const it = top.items[top.items.length - 1];
              if (it.value) {
                top.items.push({ start: [], key: token, sep: [] });
                this.onKeyLine = true;
                return;
              } else if (it.sep) {
                it.value = token;
              } else {
                Object.assign(it, { key: token, sep: [] });
                this.onKeyLine = !it.explicitKey;
                return;
              }
              break;
            }
            case "block-seq": {
              const it = top.items[top.items.length - 1];
              if (it.value)
                top.items.push({ start: [], value: token });
              else
                it.value = token;
              break;
            }
            case "flow-collection": {
              const it = top.items[top.items.length - 1];
              if (!it || it.value)
                top.items.push({ start: [], key: token, sep: [] });
              else if (it.sep)
                it.value = token;
              else
                Object.assign(it, { key: token, sep: [] });
              return;
            }
            /* istanbul ignore next should not happen */
            default:
              yield* this.pop();
              yield* this.pop(token);
          }
          if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
            const last = token.items[token.items.length - 1];
            if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
              if (top.type === "document")
                top.end = last.start;
              else
                top.items.push({ start: last.start });
              token.items.splice(-1, 1);
            }
          }
        }
      }
      *stream() {
        switch (this.type) {
          case "directive-line":
            yield { type: "directive", offset: this.offset, source: this.source };
            return;
          case "byte-order-mark":
          case "space":
          case "comment":
          case "newline":
            yield this.sourceToken;
            return;
          case "doc-mode":
          case "doc-start": {
            const doc = {
              type: "document",
              offset: this.offset,
              start: []
            };
            if (this.type === "doc-start")
              doc.start.push(this.sourceToken);
            this.stack.push(doc);
            return;
          }
        }
        yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML stream`,
          source: this.source
        };
      }
      *document(doc) {
        if (doc.value)
          return yield* this.lineEnd(doc);
        switch (this.type) {
          case "doc-start": {
            if (findNonEmptyIndex(doc.start) !== -1) {
              yield* this.pop();
              yield* this.step();
            } else
              doc.start.push(this.sourceToken);
            return;
          }
          case "anchor":
          case "tag":
          case "space":
          case "comment":
          case "newline":
            doc.start.push(this.sourceToken);
            return;
        }
        const bv = this.startBlockValue(doc);
        if (bv)
          this.stack.push(bv);
        else {
          yield {
            type: "error",
            offset: this.offset,
            message: `Unexpected ${this.type} token in YAML document`,
            source: this.source
          };
        }
      }
      *scalar(scalar) {
        if (this.type === "map-value-ind") {
          const prev = getPrevProps(this.peek(2));
          const start = getFirstKeyStartProps(prev);
          let sep;
          if (scalar.end) {
            sep = scalar.end;
            sep.push(this.sourceToken);
            delete scalar.end;
          } else
            sep = [this.sourceToken];
          const map = {
            type: "block-map",
            offset: scalar.offset,
            indent: scalar.indent,
            items: [{ start, key: scalar, sep }]
          };
          this.onKeyLine = true;
          this.stack[this.stack.length - 1] = map;
        } else
          yield* this.lineEnd(scalar);
      }
      *blockScalar(scalar) {
        switch (this.type) {
          case "space":
          case "comment":
          case "newline":
            scalar.props.push(this.sourceToken);
            return;
          case "scalar":
            scalar.source = this.source;
            this.atNewLine = true;
            this.indent = 0;
            if (this.onNewLine) {
              let nl = this.source.indexOf("\n") + 1;
              while (nl !== 0) {
                this.onNewLine(this.offset + nl);
                nl = this.source.indexOf("\n", nl) + 1;
              }
            }
            yield* this.pop();
            break;
          /* istanbul ignore next should not happen */
          default:
            yield* this.pop();
            yield* this.step();
        }
      }
      *blockMap(map) {
        const it = map.items[map.items.length - 1];
        switch (this.type) {
          case "newline":
            this.onKeyLine = false;
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              it.start.push(this.sourceToken);
            }
            return;
          case "space":
          case "comment":
            if (it.value) {
              map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              if (this.atIndentedComment(it.start, map.indent)) {
                const prev = map.items[map.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  Array.prototype.push.apply(end, it.start);
                  end.push(this.sourceToken);
                  map.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
        }
        if (this.indent >= map.indent) {
          const atMapIndent = !this.onKeyLine && this.indent === map.indent;
          const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
          let start = [];
          if (atNextItem && it.sep && !it.value) {
            const nl = [];
            for (let i = 0; i < it.sep.length; ++i) {
              const st = it.sep[i];
              switch (st.type) {
                case "newline":
                  nl.push(i);
                  break;
                case "space":
                  break;
                case "comment":
                  if (st.indent > map.indent)
                    nl.length = 0;
                  break;
                default:
                  nl.length = 0;
              }
            }
            if (nl.length >= 2)
              start = it.sep.splice(nl[1]);
          }
          switch (this.type) {
            case "anchor":
            case "tag":
              if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map.items.push({ start });
                this.onKeyLine = true;
              } else if (it.sep) {
                it.sep.push(this.sourceToken);
              } else {
                it.start.push(this.sourceToken);
              }
              return;
            case "explicit-key-ind":
              if (!it.sep && !it.explicitKey) {
                it.start.push(this.sourceToken);
                it.explicitKey = true;
              } else if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map.items.push({ start, explicitKey: true });
              } else {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [this.sourceToken], explicitKey: true }]
                });
              }
              this.onKeyLine = true;
              return;
            case "map-value-ind":
              if (it.explicitKey) {
                if (!it.sep) {
                  if (includesToken(it.start, "newline")) {
                    Object.assign(it, { key: null, sep: [this.sourceToken] });
                  } else {
                    const start2 = getFirstKeyStartProps(it.start);
                    this.stack.push({
                      type: "block-map",
                      offset: this.offset,
                      indent: this.indent,
                      items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                    });
                  }
                } else if (it.value) {
                  map.items.push({ start: [], key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start, key: null, sep: [this.sourceToken] }]
                  });
                } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
                  const start2 = getFirstKeyStartProps(it.start);
                  const key = it.key;
                  const sep = it.sep;
                  sep.push(this.sourceToken);
                  delete it.key;
                  delete it.sep;
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: start2, key, sep }]
                  });
                } else if (start.length > 0) {
                  it.sep = it.sep.concat(start, this.sourceToken);
                } else {
                  it.sep.push(this.sourceToken);
                }
              } else {
                if (!it.sep) {
                  Object.assign(it, { key: null, sep: [this.sourceToken] });
                } else if (it.value || atNextItem) {
                  map.items.push({ start, key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: [], key: null, sep: [this.sourceToken] }]
                  });
                } else {
                  it.sep.push(this.sourceToken);
                }
              }
              this.onKeyLine = true;
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs = this.flowScalar(this.type);
              if (atNextItem || it.value) {
                map.items.push({ start, key: fs, sep: [] });
                this.onKeyLine = true;
              } else if (it.sep) {
                this.stack.push(fs);
              } else {
                Object.assign(it, { key: fs, sep: [] });
                this.onKeyLine = true;
              }
              return;
            }
            default: {
              const bv = this.startBlockValue(map);
              if (bv) {
                if (bv.type === "block-seq") {
                  if (!it.explicitKey && it.sep && !includesToken(it.sep, "newline")) {
                    yield* this.pop({
                      type: "error",
                      offset: this.offset,
                      message: "Unexpected block-seq-ind on same line with key",
                      source: this.source
                    });
                    return;
                  }
                } else if (atMapIndent) {
                  map.items.push({ start });
                }
                this.stack.push(bv);
                return;
              }
            }
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *blockSequence(seq) {
        const it = seq.items[seq.items.length - 1];
        switch (this.type) {
          case "newline":
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                seq.items.push({ start: [this.sourceToken] });
            } else
              it.start.push(this.sourceToken);
            return;
          case "space":
          case "comment":
            if (it.value)
              seq.items.push({ start: [this.sourceToken] });
            else {
              if (this.atIndentedComment(it.start, seq.indent)) {
                const prev = seq.items[seq.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  Array.prototype.push.apply(end, it.start);
                  end.push(this.sourceToken);
                  seq.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
          case "anchor":
          case "tag":
            if (it.value || this.indent <= seq.indent)
              break;
            it.start.push(this.sourceToken);
            return;
          case "seq-item-ind":
            if (this.indent !== seq.indent)
              break;
            if (it.value || includesToken(it.start, "seq-item-ind"))
              seq.items.push({ start: [this.sourceToken] });
            else
              it.start.push(this.sourceToken);
            return;
        }
        if (this.indent > seq.indent) {
          const bv = this.startBlockValue(seq);
          if (bv) {
            this.stack.push(bv);
            return;
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *flowCollection(fc) {
        const it = fc.items[fc.items.length - 1];
        if (this.type === "flow-error-end") {
          let top;
          do {
            yield* this.pop();
            top = this.peek(1);
          } while (top && top.type === "flow-collection");
        } else if (fc.end.length === 0) {
          switch (this.type) {
            case "comma":
            case "explicit-key-ind":
              if (!it || it.sep)
                fc.items.push({ start: [this.sourceToken] });
              else
                it.start.push(this.sourceToken);
              return;
            case "map-value-ind":
              if (!it || it.value)
                fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              return;
            case "space":
            case "comment":
            case "newline":
            case "anchor":
            case "tag":
              if (!it || it.value)
                fc.items.push({ start: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                it.start.push(this.sourceToken);
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs = this.flowScalar(this.type);
              if (!it || it.value)
                fc.items.push({ start: [], key: fs, sep: [] });
              else if (it.sep)
                this.stack.push(fs);
              else
                Object.assign(it, { key: fs, sep: [] });
              return;
            }
            case "flow-map-end":
            case "flow-seq-end":
              fc.end.push(this.sourceToken);
              return;
          }
          const bv = this.startBlockValue(fc);
          if (bv)
            this.stack.push(bv);
          else {
            yield* this.pop();
            yield* this.step();
          }
        } else {
          const parent = this.peek(2);
          if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
            yield* this.pop();
            yield* this.step();
          } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            fixFlowSeqItems(fc);
            const sep = fc.end.splice(1, fc.end.length);
            sep.push(this.sourceToken);
            const map = {
              type: "block-map",
              offset: fc.offset,
              indent: fc.indent,
              items: [{ start, key: fc, sep }]
            };
            this.onKeyLine = true;
            this.stack[this.stack.length - 1] = map;
          } else {
            yield* this.lineEnd(fc);
          }
        }
      }
      flowScalar(type) {
        if (this.onNewLine) {
          let nl = this.source.indexOf("\n") + 1;
          while (nl !== 0) {
            this.onNewLine(this.offset + nl);
            nl = this.source.indexOf("\n", nl) + 1;
          }
        }
        return {
          type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
      }
      startBlockValue(parent) {
        switch (this.type) {
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return this.flowScalar(this.type);
          case "block-scalar-header":
            return {
              type: "block-scalar",
              offset: this.offset,
              indent: this.indent,
              props: [this.sourceToken],
              source: ""
            };
          case "flow-map-start":
          case "flow-seq-start":
            return {
              type: "flow-collection",
              offset: this.offset,
              indent: this.indent,
              start: this.sourceToken,
              items: [],
              end: []
            };
          case "seq-item-ind":
            return {
              type: "block-seq",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken] }]
            };
          case "explicit-key-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            start.push(this.sourceToken);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, explicitKey: true }]
            };
          }
          case "map-value-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, key: null, sep: [this.sourceToken] }]
            };
          }
        }
        return null;
      }
      atIndentedComment(start, indent) {
        if (this.type !== "comment")
          return false;
        if (this.indent <= indent)
          return false;
        return start.every((st) => st.type === "newline" || st.type === "space");
      }
      *documentEnd(docEnd) {
        if (this.type !== "doc-mode") {
          if (docEnd.end)
            docEnd.end.push(this.sourceToken);
          else
            docEnd.end = [this.sourceToken];
          if (this.type === "newline")
            yield* this.pop();
        }
      }
      *lineEnd(token) {
        switch (this.type) {
          case "comma":
          case "doc-start":
          case "doc-end":
          case "flow-seq-end":
          case "flow-map-end":
          case "map-value-ind":
            yield* this.pop();
            yield* this.step();
            break;
          case "newline":
            this.onKeyLine = false;
          // fallthrough
          case "space":
          case "comment":
          default:
            if (token.end)
              token.end.push(this.sourceToken);
            else
              token.end = [this.sourceToken];
            if (this.type === "newline")
              yield* this.pop();
        }
      }
    };
    exports2.Parser = Parser;
  }
});

// node_modules/yaml/dist/public-api.js
var require_public_api = __commonJS({
  "node_modules/yaml/dist/public-api.js"(exports2) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var errors = require_errors();
    var log = require_log();
    var identity = require_identity();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    function parseOptions(options) {
      const prettyErrors = options.prettyErrors !== false;
      const lineCounter$1 = options.lineCounter || prettyErrors && new lineCounter.LineCounter() || null;
      return { lineCounter: lineCounter$1, prettyErrors };
    }
    function parseAllDocuments(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      const docs = Array.from(composer$1.compose(parser$1.parse(source)));
      if (prettyErrors && lineCounter2)
        for (const doc of docs) {
          doc.errors.forEach(errors.prettifyError(source, lineCounter2));
          doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
        }
      if (docs.length > 0)
        return docs;
      return Object.assign([], { empty: true }, composer$1.streamInfo());
    }
    function parseDocument2(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      let doc = null;
      for (const _doc of composer$1.compose(parser$1.parse(source), true, source.length)) {
        if (!doc)
          doc = _doc;
        else if (doc.options.logLevel !== "silent") {
          doc.errors.push(new errors.YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
          break;
        }
      }
      if (prettyErrors && lineCounter2) {
        doc.errors.forEach(errors.prettifyError(source, lineCounter2));
        doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
      }
      return doc;
    }
    function parse3(src, reviver, options) {
      let _reviver = void 0;
      if (typeof reviver === "function") {
        _reviver = reviver;
      } else if (options === void 0 && reviver && typeof reviver === "object") {
        options = reviver;
      }
      const doc = parseDocument2(src, options);
      if (!doc)
        return null;
      doc.warnings.forEach((warning) => log.warn(doc.options.logLevel, warning));
      if (doc.errors.length > 0) {
        if (doc.options.logLevel !== "silent")
          throw doc.errors[0];
        else
          doc.errors = [];
      }
      return doc.toJS(Object.assign({ reviver: _reviver }, options));
    }
    function stringify(value, replacer, options) {
      let _replacer = null;
      if (typeof replacer === "function" || Array.isArray(replacer)) {
        _replacer = replacer;
      } else if (options === void 0 && replacer) {
        options = replacer;
      }
      if (typeof options === "string")
        options = options.length;
      if (typeof options === "number") {
        const indent = Math.round(options);
        options = indent < 1 ? void 0 : indent > 8 ? { indent: 8 } : { indent };
      }
      if (value === void 0) {
        const { keepUndefined } = options ?? replacer ?? {};
        if (!keepUndefined)
          return void 0;
      }
      if (identity.isDocument(value) && !_replacer)
        return value.toString(options);
      return new Document.Document(value, _replacer, options).toString(options);
    }
    exports2.parse = parse3;
    exports2.parseAllDocuments = parseAllDocuments;
    exports2.parseDocument = parseDocument2;
    exports2.stringify = stringify;
  }
});

// node_modules/yaml/dist/index.js
var require_dist = __commonJS({
  "node_modules/yaml/dist/index.js"(exports2) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var Schema = require_Schema();
    var errors = require_errors();
    var Alias = require_Alias();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var cst = require_cst();
    var lexer = require_lexer();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    var publicApi = require_public_api();
    var visit2 = require_visit();
    exports2.Composer = composer.Composer;
    exports2.Document = Document.Document;
    exports2.Schema = Schema.Schema;
    exports2.YAMLError = errors.YAMLError;
    exports2.YAMLParseError = errors.YAMLParseError;
    exports2.YAMLWarning = errors.YAMLWarning;
    exports2.Alias = Alias.Alias;
    exports2.isAlias = identity.isAlias;
    exports2.isCollection = identity.isCollection;
    exports2.isDocument = identity.isDocument;
    exports2.isMap = identity.isMap;
    exports2.isNode = identity.isNode;
    exports2.isPair = identity.isPair;
    exports2.isScalar = identity.isScalar;
    exports2.isSeq = identity.isSeq;
    exports2.Pair = Pair.Pair;
    exports2.Scalar = Scalar.Scalar;
    exports2.YAMLMap = YAMLMap.YAMLMap;
    exports2.YAMLSeq = YAMLSeq.YAMLSeq;
    exports2.CST = cst;
    exports2.Lexer = lexer.Lexer;
    exports2.LineCounter = lineCounter.LineCounter;
    exports2.Parser = parser.Parser;
    exports2.parse = publicApi.parse;
    exports2.parseAllDocuments = publicApi.parseAllDocuments;
    exports2.parseDocument = publicApi.parseDocument;
    exports2.stringify = publicApi.stringify;
    exports2.visit = visit2.visit;
    exports2.visitAsync = visit2.visitAsync;
  }
});

// src/shared/contracts.ts
function normalizeOverlay(value) {
  const { options } = value;
  if (!options) return value;
  const { chat_template_kwargs, extraBody, ...settings2 } = options;
  return {
    ...value,
    options: void 0,
    settings: { ...settings2, ...value.settings },
    body: {
      ...extraBody && typeof extraBody === "object" && !Array.isArray(extraBody) ? extraBody : {},
      ...chat_template_kwargs === void 0 ? {} : { chat_template_kwargs },
      ...value.body
    }
  };
}
var endpoint, openVikingSchema, modelSchema, namedModelSchema, providerSettings, overlayFields, variantID, variantOverlay, variantsSchema, providerModel, providerSchema, selectionSchema, rawConfigSchema, configSchema, requestSchema;
var init_contracts = __esm({
  "src/shared/contracts.ts"() {
    "use strict";
    init_zod();
    endpoint = external_exports.string().trim().url().superRefine((value, ctx) => {
      let url;
      try {
        url = new URL(value);
      } catch {
        return;
      }
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash || /\/(?:embeddings|chat\/completions)\/?$/.test(url.pathname)) {
        ctx.addIssue({ code: external_exports.ZodIssueCode.custom, message: "\uC778\uC99D \uC815\uBCF4 \uC5C6\uC774 API \uAE30\uC900 \uACBD\uB85C(/v1 \uB4F1)\uB97C \uC9C0\uC815\uD558\uC138\uC694." });
      }
    });
    openVikingSchema = external_exports.object({
      enabled: external_exports.boolean().default(true),
      embedding: external_exports.object({ baseUrl: endpoint, apiKey: external_exports.string().trim().min(1).max(8192), id: external_exports.string().trim().min(1).max(256), dimension: external_exports.number().int().min(1).max(65536) }).strict(),
      vlm: external_exports.object({ baseUrl: endpoint, apiKey: external_exports.string().trim().min(1).max(8192), id: external_exports.string().trim().min(1).max(256) }).strict().optional()
    }).strict();
    modelSchema = external_exports.object({ baseUrl: endpoint, apiKey: external_exports.string().trim().min(1).max(8192), id: external_exports.string().trim().min(1).max(256) }).strict();
    namedModelSchema = modelSchema.extend({ name: external_exports.string().trim().min(1).max(128), providerID: external_exports.string().optional(), modelKey: external_exports.string().optional() }).strict();
    providerSettings = external_exports.object({
      baseURL: endpoint,
      apiKey: external_exports.string().trim().min(1).max(8192).optional(),
      APIKey: external_exports.string().trim().min(1).max(8192).optional()
    }).passthrough().superRefine((data, ctx) => {
      if (!data.apiKey && !data.APIKey) ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["apiKey"], message: "settings.apiKey \uB610\uB294 APIKey\uB97C \uC785\uB825\uD558\uC138\uC694." });
      if (data.apiKey && data.APIKey && data.apiKey !== data.APIKey) ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["APIKey"], message: "apiKey\uC640 APIKey\uC758 \uAC12\uC774 \uB2E4\uB985\uB2C8\uB2E4." });
    });
    overlayFields = {
      settings: external_exports.record(external_exports.unknown()).optional(),
      body: external_exports.record(external_exports.unknown()).optional(),
      options: external_exports.record(external_exports.unknown()).optional()
    };
    variantID = external_exports.string().trim().min(1).max(128);
    variantOverlay = external_exports.object({ ...overlayFields, headers: external_exports.record(external_exports.string()).optional() }).passthrough().transform(({ settings: settings2, body, options, headers, ...legacy }) => normalizeOverlay({ settings: settings2, body, headers, options: { ...legacy, ...options } }));
    variantsSchema = external_exports.union([
      external_exports.array(external_exports.object({ id: variantID, ...overlayFields, headers: external_exports.record(external_exports.string()).optional() }).strict().transform(normalizeOverlay)).max(32),
      external_exports.record(variantID, variantOverlay).transform((value) => Object.entries(value).map(([id, overlay]) => ({ id, ...overlay })))
    ]).superRefine((value, ctx) => {
      if (value.length > 32 || new Set(value.map((v) => v.id)).size !== value.length)
        ctx.addIssue({ code: external_exports.ZodIssueCode.custom, message: "variant ID\uB294 \uACE0\uC720\uD574\uC57C \uD558\uBA70 32\uAC1C \uC774\uD558\uB85C \uC9C0\uC815\uD558\uC138\uC694." });
    });
    providerModel = external_exports.object({
      name: external_exports.string().min(1).max(128).optional(),
      modelID: external_exports.string().min(1).max(256).optional(),
      capabilities: external_exports.object({ tools: external_exports.boolean().optional(), input: external_exports.array(external_exports.enum(["text", "image", "audio", "video", "pdf"])).optional(), output: external_exports.array(external_exports.enum(["text", "image", "audio", "video", "pdf"])).optional() }).passthrough().optional(),
      cost: external_exports.object({ input: external_exports.number().nonnegative(), output: external_exports.number().nonnegative(), cache: external_exports.object({ read: external_exports.number().nonnegative(), write: external_exports.number().nonnegative() }).optional() }).optional(),
      limit: external_exports.object({ context: external_exports.number().int().positive().optional(), input: external_exports.number().int().positive().optional(), output: external_exports.number().int().positive().optional() }).optional(),
      ...overlayFields,
      variants: variantsSchema.optional()
    }).passthrough().transform(normalizeOverlay);
    providerSchema = external_exports.object({
      name: external_exports.string().min(1).max(128).optional(),
      package: external_exports.literal("@opencode/ai/providers/openai-compatible").default("@opencode/ai/providers/openai-compatible"),
      env: external_exports.array(external_exports.string().min(1).max(128)).max(32).optional(),
      settings: providerSettings,
      models: external_exports.record(external_exports.string().min(1).max(256).refine((value) => !value.includes("#")), providerModel).refine((value) => Object.keys(value).length > 0 && Object.keys(value).length <= 32)
    }).strict();
    selectionSchema = external_exports.union([external_exports.string().min(3), external_exports.object({ providerID: external_exports.string().min(1), model: external_exports.string().min(1), variant: external_exports.string().optional() }).strict()]);
    rawConfigSchema = external_exports.object({
      schemaVersion: external_exports.union([external_exports.literal(1), external_exports.literal(2)]).default(2),
      model: external_exports.union([modelSchema, selectionSchema]).optional(),
      providers: external_exports.record(external_exports.string().min(1).max(128).refine((value) => !/[\/#]/.test(value)), providerSchema).optional(),
      models: external_exports.array(namedModelSchema).min(1).max(32).optional(),
      defaultModel: external_exports.string().max(128).optional(),
      defaultVariant: variantID.optional(),
      openViking: openVikingSchema.optional(),
      compaction: external_exports.object({ maxOutputTokens: external_exports.number().int().min(256).max(65536).default(8192), retryOnLength: external_exports.boolean().default(true), disableQwenThinking: external_exports.boolean().default(true) }).strict().optional()
    }).strict();
    configSchema = rawConfigSchema.superRefine((data, ctx) => {
      if (!data.model && !data.models?.length && !Object.keys(data.providers ?? {}).length) ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["providers"], message: "LLM \uBAA8\uB378\uC744 \uD55C \uAC1C \uC774\uC0C1 \uB4F1\uB85D\uD558\uC138\uC694." });
      if (data.models && new Set(data.models.map((m) => m.name)).size !== data.models.length) ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["models"], message: "LLM \uD45C\uC2DC \uC774\uB984\uC740 \uACE0\uC720\uD574\uC57C \uD569\uB2C8\uB2E4." });
      if (data.defaultModel && !data.providers && !data.models?.some((m) => m.name === data.defaultModel)) ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["defaultModel"], message: "\uB4F1\uB85D\uB41C \uBAA8\uB378 \uC774\uB984\uC744 \uC120\uD0DD\uD558\uC138\uC694." });
      if (data.model && (typeof data.model === "string" || "providerID" in data.model)) {
        const selection = typeof data.model === "string" ? { providerID: data.model.split("/")[0], model: data.model.slice(data.model.indexOf("/") + 1) } : data.model;
        const definition = data.providers?.[selection.providerID]?.models[selection.model];
        if ("variant" in selection && selection.variant && definition?.variants && !definition.variants.some((v) => v.id === selection.variant)) ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["model", "variant"], message: "\uB4F1\uB85D\uB41C variant ID\uB97C \uC9C0\uC815\uD558\uC138\uC694." });
        if (!definition) ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["model"], message: "\uB4F1\uB85D\uB41C providers\uC640 models\uC758 \uBCC4\uCE6D\uC744 \uC9C0\uC815\uD558\uC138\uC694." });
      }
    }).transform((data) => {
      const fromProviders = Object.entries(data.providers ?? {}).flatMap(([providerID, provider]) => Object.entries(provider.models).map(([modelKey, definition]) => ({
        name: `${provider.name ?? providerID} \xB7 ${definition.name ?? modelKey}`.slice(0, 128),
        providerID,
        modelKey,
        baseUrl: provider.settings.baseURL,
        apiKey: provider.settings.apiKey ?? provider.settings.APIKey,
        id: definition.modelID ?? modelKey
      })));
      const models = fromProviders.length ? fromProviders.map((m, index) => ({ ...m, name: `${m.name.slice(0, 119)} [${index + 1}]` })) : data.models;
      const selection = typeof data.model === "string" ? { providerID: data.model.split("/")[0], model: data.model.slice(data.model.indexOf("/") + 1) } : data.model && "providerID" in data.model ? data.model : void 0;
      const model2 = models?.find((m) => selection ? m.providerID === selection.providerID && m.modelKey === selection.model : m.name === data.defaultModel) ?? models?.[0] ?? data.model;
      return { ...data, ...selection && "variant" in selection && selection.variant ? { defaultVariant: selection.variant } : {}, ...models ? { models, defaultModel: models.find((m) => m === model2)?.name ?? data.defaultModel } : {}, model: { baseUrl: model2.baseUrl, apiKey: model2.apiKey, id: model2.id } };
    });
    requestSchema = external_exports.discriminatedUnion("action", [
      external_exports.object({ action: external_exports.literal("state") }).strict(),
      external_exports.object({ action: external_exports.literal("importConfig"), replace: external_exports.boolean() }).strict(),
      external_exports.object({ action: external_exports.literal("openProject") }).strict(),
      external_exports.object({ action: external_exports.literal("newSession"), projectId: external_exports.string().max(128) }).strict(),
      external_exports.object({
        action: external_exports.literal("selectSession"),
        sessionId: external_exports.string().max(128)
      }).strict(),
      external_exports.object({
        action: external_exports.literal("send"),
        text: external_exports.string().trim().min(1).max(32e3)
      }).strict(),
      external_exports.object({ action: external_exports.literal("stop") }).strict(),
      external_exports.object({ action: external_exports.literal("replay") }).strict(),
      external_exports.object({
        action: external_exports.literal("approve"),
        proposalId: external_exports.string().max(128),
        decision: external_exports.enum(["once", "session", "reject"])
      }).strict(),
      external_exports.object({ action: external_exports.literal("resetApproval") }).strict(),
      external_exports.object({ action: external_exports.literal("selectModel"), name: external_exports.string().min(1).max(128) }).strict(),
      external_exports.object({ action: external_exports.literal("indexKnowledge"), path: external_exports.string().min(1).max(4096) }).strict(),
      external_exports.object({ action: external_exports.literal("readFile"), path: external_exports.string().max(4096) }).strict()
    ]);
  }
});

// src/main/config.ts
async function atomicJSON(file, value) {
  await (0, import_promises8.mkdir)(import_node_path9.default.dirname(file), { recursive: true, mode: 448 });
  const temp = `${file}.${(0, import_node_crypto3.randomUUID)()}.tmp`;
  try {
    await (0, import_promises8.writeFile)(temp, JSON.stringify(value, null, 2), {
      mode: 384,
      flag: "wx"
    });
    await (0, import_promises8.rename)(temp, file);
  } finally {
    await (0, import_promises8.unlink)(temp).catch(() => {
    });
  }
}
var import_promises8, import_node_crypto3, import_node_path9;
var init_config = __esm({
  "src/main/config.ts"() {
    "use strict";
    import_promises8 = require("node:fs/promises");
    import_node_crypto3 = require("node:crypto");
    import_node_path9 = __toESM(require("node:path"), 1);
    init_contracts();
  }
});

// src/main/openviking-errors.ts
function vikingErrorCode(text) {
  if (/^OV_(?:AUTH|EMBEDDING_DIMENSION|TOKENIZER|PERMISSION|PATH_LENGTH|PATH|CONNECTION|NOT_FOUND|CONFLICT|RESPONSE_FORMAT|REQUEST)$/.test(text)) return text;
  if (/invalid.*(?:api.?key|token)|unauthorized|authentication/i.test(text)) return "OV_AUTH";
  if (/dimension|vector.*(?:size|length)/i.test(text)) return "OV_EMBEDDING_DIMENSION";
  if (/cl100k|tiktoken|tokenizer/i.test(text)) return "OV_TOKENIZER";
  if (/WinError 5|PermissionError|Access is denied|permission denied/i.test(text)) return "OV_PERMISSION";
  if (/WinError 206|filename.*too long|path.*too long/i.test(text)) return "OV_PATH_LENGTH";
  if (/invalid.*(?:path|uri)|not.*valid.*uri|unsupported.*scheme/i.test(text)) return "OV_PATH";
  if (/connection|ECONNRESET|ECONNREFUSED|ENOTFOUND|network|DNS/i.test(text)) return "OV_CONNECTION";
  if (/not found|NOT_FOUND/i.test(text)) return "OV_NOT_FOUND";
  if (/conflict|already exists|ALREADY_EXISTS/i.test(text)) return "OV_CONFLICT";
  if (/json|validation|INVALID_ARGUMENT/i.test(text)) return "OV_RESPONSE_FORMAT";
  return "OV_REQUEST";
}
var init_openviking_errors = __esm({
  "src/main/openviking-errors.ts"() {
    "use strict";
  }
});

// src/main/openviking-namespace.ts
async function backupVikingAccount(baseUrl, headers, file, signal) {
  const target = new URL("/api/v1/pack/backup", baseUrl);
  if (target.protocol !== "http:" || target.hostname !== "127.0.0.1") throw new Error("OV_NAMESPACE_ENDPOINT");
  const attempt = (vectors) => new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const body = JSON.stringify({ include_vectors: vectors });
    const req = (0, import_node_http.request)(target, { method: "POST", headers: { ...headers, "Content-Type": "application/json", "Content-Length": String(Buffer.byteLength(body)) }, signal }, (res) => {
      if (res.statusCode !== 200) {
        let error = "";
        res.on("data", (b) => {
          if (error.length < 65536) error += b.toString();
          else res.destroy();
        });
        res.once("error", reject);
        res.once("end", () => {
          if (vectors && res.statusCode === 400 && error.includes("Cannot export incomplete OpenViking vector index snapshot")) resolve(false);
          else reject(new Error("OV_NAMESPACE_EXPORT"));
        });
        return;
      }
      let size = 0;
      const bound = new import_node_stream.Transform({ transform(chunk, _encoding, done) {
        size += chunk.length;
        done(size > 2 * 1024 * 1024 * 1024 ? new Error("OV_NAMESPACE_SIZE") : null, chunk);
      } });
      (0, import_promises10.pipeline)(res, bound, (0, import_node_fs2.createWriteStream)(file, { flags: "wx", mode: 384 }), { signal }).then(() => resolve(true), reject);
    });
    req.on("socket", (socket) => socket.setKeepAlive(true, 6e4));
    req.once("error", reject);
    req.end(body);
  });
  if (!await attempt(true)) await attempt(false);
}
function skillRecords(bytes) {
  const value = JSON.parse(bytes.toString("utf8"));
  if (value.schemaVersion !== 1 || !value.entries || Array.isArray(value.entries) || typeof value.entries !== "object" || Object.values(value.entries).some((e) => typeof e?.bundleHash !== "string" || typeof e?.revision !== "string")) throw new Error("OV_NAMESPACE_REGISTRY");
  return value;
}
async function smallFile(file) {
  const stat = await (0, import_promises9.lstat)(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1024 * 1024) throw new Error("OV_NAMESPACE_STATE");
  return (0, import_promises9.readFile)(file);
}
async function directory(file) {
  try {
    const stat = await (0, import_promises9.lstat)(file);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error("OV_NAMESPACE_PATH");
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}
async function exists(file) {
  try {
    await (0, import_promises9.lstat)(file);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}
async function noLinks(folder) {
  for (const entry of await (0, import_promises9.readdir)(folder, { withFileTypes: true })) {
    const file = import_node_path10.default.join(folder, entry.name), stat = await (0, import_promises9.lstat)(file);
    if (stat.isSymbolicLink() || !stat.isDirectory() && !stat.isFile()) throw new Error("OV_NAMESPACE_PATH");
    if (stat.isDirectory()) await noLinks(file);
  }
}
async function migrateVikingNamespace(folder, runtime, signal) {
  const active2 = import_node_path10.default.join(folder, "data"), journal = import_node_path10.default.join(folder, "namespace-migration.json");
  let record;
  try {
    const stat2 = await (0, import_promises9.lstat)(journal);
    if (!stat2.isFile() || stat2.isSymbolicLink() || stat2.size > 4096) throw new Error("OV_NAMESPACE_STATE");
    record = JSON.parse(await (0, import_promises9.readFile)(journal, "utf8"));
    if (record?.schemaVersion !== 1 || !/^[a-f0-9]{32}$/.test(record.id) || !["exporting", "restoring", "committing", "ready", "failed"].includes(record.phase)) throw new Error("OV_NAMESPACE_STATE");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const paths = (id) => {
    const backup2 = import_node_path10.default.join(folder, "namespace-backups", id);
    return { backup: backup2, stage: import_node_path10.default.join(backup2, "staged"), source: import_node_path10.default.join(backup2, "read-source"), original: import_node_path10.default.join(backup2, "original"), pack: import_node_path10.default.join(backup2, "snapshot.ovpack") };
  };
  const save = async (phase) => {
    record.phase = phase;
    await atomicJSON(journal, record);
  };
  const finishRegistry = async () => {
    if (!record?.registry) return;
    const base = paths(record.id).backup;
    const previous = await smallFile(import_node_path10.default.join(base, "bundled-skills.previous.json"));
    const next = await smallFile(import_node_path10.default.join(base, "bundled-skills.next.json"));
    skillRecords(previous);
    const parsed = skillRecords(next);
    const current = await smallFile(import_node_path10.default.join(folder, "bundled-skills.json"));
    const hash2 = (bytes) => (0, import_node_crypto4.createHash)("sha256").update(bytes).digest("hex");
    if (hash2(current) === hash2(next)) return;
    if (hash2(current) !== hash2(previous)) throw new Error("OV_NAMESPACE_REGISTRY_CONFLICT");
    await atomicJSON(import_node_path10.default.join(folder, "bundled-skills.json"), parsed);
  };
  if (record?.phase === "committing") {
    const p2 = paths(record.id);
    if (!await directory(p2.backup)) throw new Error("OV_NAMESPACE_STATE");
    if (await exists(p2.stage)) {
      if (!await directory(p2.stage) || !await directory(import_node_path10.default.join(p2.stage, "viking", vikingAccount)) || await exists(import_node_path10.default.join(p2.stage, "viking", previousVikingAccount))) throw new Error("OV_NAMESPACE_STATE");
      await noLinks(p2.stage);
    }
    if (!await exists(active2) && await directory(p2.original) && await directory(p2.stage)) await (0, import_promises9.rename)(p2.stage, active2);
    if (await directory(import_node_path10.default.join(active2, "viking", vikingAccount)) && await directory(p2.original) && !await exists(p2.stage)) {
      await finishRegistry();
      await save("ready");
      return;
    }
    if (await directory(import_node_path10.default.join(active2, "viking", previousVikingAccount)) && await directory(p2.stage) && !await exists(p2.original)) {
      await (0, import_promises9.rename)(active2, p2.original);
      await (0, import_promises9.rename)(p2.stage, active2);
      await finishRegistry();
      await save("ready");
      return;
    }
    throw new Error("OV_NAMESPACE_STATE");
  }
  if (!await directory(active2)) return;
  const old = await directory(import_node_path10.default.join(active2, "viking", previousVikingAccount));
  if (!old) return;
  if (await exists(import_node_path10.default.join(active2, "viking", vikingAccount))) throw new Error("OV_NAMESPACE_CONFLICT");
  await noLinks(active2);
  signal.throwIfAborted();
  record = { schemaVersion: 1, id: (0, import_node_crypto4.randomBytes)(16).toString("hex"), phase: "exporting" };
  const p = paths(record.id);
  await (0, import_promises9.mkdir)(import_node_path10.default.join(folder, "namespace-backups"), { recursive: true, mode: 448 });
  if (!await directory(import_node_path10.default.join(folder, "namespace-backups"))) throw new Error("OV_NAMESPACE_PATH");
  await (0, import_promises9.mkdir)(p.backup, { mode: 448 });
  await (0, import_promises9.mkdir)(p.stage, { mode: 448 });
  let registry;
  try {
    const bytes = await smallFile(import_node_path10.default.join(folder, "bundled-skills.json"));
    registry = skillRecords(bytes);
    await (0, import_promises9.writeFile)(import_node_path10.default.join(p.backup, "bundled-skills.previous.json"), bytes, { flag: "wx", mode: 384 });
    record.registry = true;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await save("exporting");
  const call = async (route, body) => {
    signal.throwIfAborted();
    return runtime.request(route, { ...body === void 0 ? {} : { method: "POST", body }, signal });
  };
  const stat = async (uri) => {
    try {
      await call("/api/v1/fs/stat?uri=" + encodeURIComponent(uri));
      return true;
    } catch (error) {
      if (error.status === 404) return false;
      throw error;
    }
  };
  try {
    await (0, import_promises9.cp)(active2, p.source, { recursive: true, force: false, errorOnExist: true, preserveTimestamps: true });
    signal.throwIfAborted();
    await runtime.start(p.source, previousVikingAccount);
    await call("/api/v1/system/wait", {});
    await runtime.backup(p.pack, signal);
    await runtime.stop();
    signal.throwIfAborted();
    const agentSource = import_node_path10.default.join(p.source, "viking", previousVikingAccount, "agent");
    const hasAgent = await directory(agentSource);
    if (hasAgent) {
      await (0, import_promises9.mkdir)(import_node_path10.default.join(p.stage, "viking", vikingAccount), { recursive: true, mode: 448 });
      await (0, import_promises9.cp)(agentSource, import_node_path10.default.join(p.stage, "viking", vikingAccount, "agent"), { recursive: true, force: false, errorOnExist: true, preserveTimestamps: true });
    }
    await save("restoring");
    await runtime.start(p.stage, vikingAccount);
    const { openAsBlob: openAsBlob2 } = await import("node:fs");
    const form = new FormData();
    form.append("file", await openAsBlob2(p.pack), "snapshot.ovpack");
    const upload = await call("/api/v1/resources/temp_upload", form);
    const id = upload.result?.temp_file_id;
    if (typeof id !== "string" || !id) throw new Error("OV_NAMESPACE_UPLOAD");
    await call("/api/v1/pack/restore", { temp_file_id: id, on_conflict: "overwrite", vector_mode: "auto" });
    await call("/api/v1/system/wait", {});
    const oldResources = "viking://resources/" + previousVikingAccount, newResources = "viking://resources/ned";
    if (await stat(oldResources)) {
      if (await stat(newResources)) throw new Error("OV_NAMESPACE_CONFLICT");
      await call("/api/v1/fs/mv", { from_uri: oldResources, to_uri: newResources });
    }
    const listed = await call("/api/v1/skills?target_uri=" + encodeURIComponent("viking://agent/skills") + "&node_limit=1000");
    if (!Array.isArray(listed.result?.skills)) throw new Error("OV_NAMESPACE_SKILLS");
    const moved = [];
    const detail = (name) => call("/api/v1/skills/" + name + "?target_uri=" + encodeURIComponent("viking://agent/skills") + "&include_source=true&include_files=true&include_integrity=true");
    for (const skill of listed.result.skills) {
      const name = skill.name;
      if (typeof name !== "string" || !name.startsWith(previousSkillPrefix) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) continue;
      const remote = await detail(name);
      if (remote.result?.source?.[previousSkillOwner] !== "bundled-skills") continue;
      const from = "viking://agent/skills/" + name, to = "viking://agent/skills/ned-" + name.slice(previousSkillPrefix.length);
      if (await stat(to)) throw new Error("OV_NAMESPACE_CONFLICT");
      const id2 = name.slice(previousSkillPrefix.length), saved = registry?.entries[id2];
      if (saved && saved.revision === remote.result.revision && saved.bundleHash === remote.result.source?.[previousSkillHash])
        moved.push({ id: id2, name: "ned-" + id2, fingerprint: fingerprint(remote.result) });
      await call("/api/v1/fs/mv", { from_uri: from, to_uri: to });
    }
    if (hasAgent) await call("/api/v1/content/reindex", { uri: "viking://agent/skills", mode: "vectors_only", wait: true });
    await call("/api/v1/system/wait", {});
    for (const uri of ["viking://resources", "viking://user", ...hasAgent ? ["viking://agent/skills"] : []]) {
      const result = await call("/api/v1/system/consistency", { uri });
      if (result.result?.ok !== true) throw new Error("OV_NAMESPACE_INDEX");
    }
    for (const item of moved) {
      const remote = await detail(item.name);
      if (fingerprint(remote.result) !== item.fingerprint || typeof remote.result.revision !== "string") throw new Error("OV_NAMESPACE_SKILL_CHANGED");
      registry.entries[item.id].revision = remote.result.revision;
      const files = Object.fromEntries(remote.result.files.filter((f) => !f.is_dir && !/(^|\/)\.(abstract|overview)\.md$/.test(f.path) && typeof f.sha256 === "string").map((f) => [f.path, f.sha256]));
      if (typeof files["SKILL.md"] === "string") registry.entries[item.id].verifiedFiles = files;
    }
    if (registry) await (0, import_promises9.writeFile)(import_node_path10.default.join(p.backup, "bundled-skills.next.json"), JSON.stringify(registry, null, 2) + "\n", { flag: "wx", mode: 384 });
    await runtime.stop();
    signal.throwIfAborted();
    if (!await directory(import_node_path10.default.join(p.stage, "viking", vikingAccount)) || await exists(import_node_path10.default.join(p.stage, "viking", previousVikingAccount))) throw new Error("OV_NAMESPACE_VERIFY");
    await save("committing");
    await (0, import_promises9.rename)(active2, p.original);
    await (0, import_promises9.rename)(p.stage, active2);
    await finishRegistry();
    await save("ready");
  } catch (error) {
    await runtime.stop();
    if (record.phase !== "committing") await save("failed");
    throw error;
  }
}
var import_node_crypto4, import_promises9, import_node_path10, import_node_http, import_node_fs2, import_promises10, import_node_stream, vikingAccount, previousVikingAccount, previousSkillPrefix, previousSkillOwner, previousSkillHash, fingerprint;
var init_openviking_namespace = __esm({
  "src/main/openviking-namespace.ts"() {
    "use strict";
    import_node_crypto4 = require("node:crypto");
    import_promises9 = require("node:fs/promises");
    import_node_path10 = __toESM(require("node:path"), 1);
    init_config();
    import_node_http = require("node:http");
    import_node_fs2 = require("node:fs");
    import_promises10 = require("node:stream/promises");
    import_node_stream = require("node:stream");
    vikingAccount = "ned";
    previousVikingAccount = "l-vibe";
    previousSkillPrefix = previousVikingAccount + "-";
    previousSkillOwner = "l_vibe_owner";
    previousSkillHash = "l_vibe_bundle_sha256";
    fingerprint = (remote) => {
      if (!Array.isArray(remote?.files)) throw new Error("OV_NAMESPACE_SKILLS");
      return JSON.stringify(remote.files.filter((f) => !f.is_dir && !/(^|\/)\.(abstract|overview)\.md$/.test(f.path)).map((f) => ({ path: f.path, sha256: f.sha256 })).sort((a, b) => a.path.localeCompare(b.path)));
    };
  }
});

// src/main/openviking-skills.ts
var openviking_skills_exports = {};
__export(openviking_skills_exports, {
  bundledSkillsRoot: () => bundledSkillsRoot,
  loadBundledSkillPackages: () => loadBundledSkillPackages,
  registerBundledSkills: () => registerBundledSkills
});
function safeRelative(value) {
  if (!value || import_node_path11.default.isAbsolute(value) || /[\\:\x00-\x1f]/.test(value) || value.split("/").some((p) => !p || p === "." || p === "..")) throw new Error("\uAE30\uBCF8 \uC2A4\uD0AC \uACBD\uB85C \uC624\uB958");
  return value;
}
function archive(files, name) {
  const local = [], central = [];
  let offset = 0;
  for (const [relative, bytes] of files) {
    const filename = Buffer.from(name + "/" + safeRelative(relative));
    const crc = (0, import_node_zlib3.crc32)(bytes);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(67324752);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(2048, 6);
    header.writeUInt16LE(33, 12);
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(bytes.length, 18);
    header.writeUInt32LE(bytes.length, 22);
    header.writeUInt16LE(filename.length, 26);
    const directory4 = Buffer.alloc(46);
    directory4.writeUInt32LE(33639248);
    directory4.writeUInt16LE(20, 4);
    directory4.writeUInt16LE(20, 6);
    directory4.writeUInt16LE(2048, 8);
    directory4.writeUInt16LE(33, 14);
    directory4.writeUInt32LE(crc, 16);
    directory4.writeUInt32LE(bytes.length, 20);
    directory4.writeUInt32LE(bytes.length, 24);
    directory4.writeUInt16LE(filename.length, 28);
    directory4.writeUInt32LE(offset, 42);
    local.push(header, filename, bytes);
    central.push(directory4, filename);
    offset += header.length + filename.length + bytes.length;
  }
  const directory3 = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(101010256);
  end.writeUInt16LE(files.size, 8);
  end.writeUInt16LE(files.size, 10);
  end.writeUInt32LE(directory3.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory3, end]);
}
async function loadBundledSkillPackages(root, lockFile = import_node_path11.default.join(root, "..", "skills-lock.json")) {
  const manifestBytes = await (0, import_promises11.readFile)(import_node_path11.default.join(root, "manifest.json"));
  const lock = JSON.parse(await (0, import_promises11.readFile)(lockFile, "utf8"));
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  if (lock.schemaVersion !== 1 || lock.manifestSha256 !== digest(manifestBytes) || manifest.schemaVersion !== 1 || !Array.isArray(manifest.skills) || lock.count !== manifest.skills.length) throw new Error("\uAE30\uBCF8 \uC2A4\uD0AC \uBAA9\uB85D \uBB34\uACB0\uC131 \uC624\uB958");
  const base = await (0, import_promises11.realpath)(root), ids = /* @__PURE__ */ new Set();
  const packages = [];
  for (const entry of manifest.skills) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id) || entry.id.length > 56 || ids.has(entry.id) || entry.directory !== entry.id || !Array.isArray(entry.files) || entry.files.length > 500) throw new Error("\uAE30\uBCF8 \uC2A4\uD0AC \uD615\uC2DD \uC624\uB958");
    ids.add(entry.id);
    const name = "ned-" + entry.id, files = /* @__PURE__ */ new Map();
    let total = 0;
    for (const file of entry.files) {
      const relative = safeRelative(file.path);
      if (!/\.(md|txt)$/i.test(relative) && !/^(LICENSE|COPYING)$/i.test(import_node_path11.default.posix.basename(relative))) throw new Error("\uC2E4\uD589\uD615 \uC2A4\uD0AC \uD30C\uC77C \uCC28\uB2E8");
      const resolved = await (0, import_promises11.realpath)(import_node_path11.default.join(base, entry.directory, relative));
      const within = import_node_path11.default.relative(import_node_path11.default.join(base, entry.directory), resolved);
      if (within.startsWith("..") || import_node_path11.default.isAbsolute(within) || files.has(relative)) throw new Error("\uAE30\uBCF8 \uC2A4\uD0AC \uBC94\uC704 \uC624\uB958");
      const bytes2 = await (0, import_promises11.readFile)(resolved);
      total += bytes2.length;
      if (total > 8 * 1024 * 1024 || digest(bytes2) !== file.sha256) throw new Error("\uAE30\uBCF8 \uC2A4\uD0AC \uD30C\uC77C \uBB34\uACB0\uC131 \uC624\uB958");
      files.set(relative, bytes2);
    }
    const main = files.get("SKILL.md");
    if (!main) throw new Error("\uAE30\uBCF8 \uC2A4\uD0AC \uBCF8\uBB38 \uC5C6\uC74C");
    const body = `# Ned bundled skill: ${entry.id}

${entry.adapter}

This is static guidance. It does not install an executor, grant permissions or upload personal conversations. Use the local Ned skill catalog ID ${entry.id} for the reviewed original package.

${bodyOf(main.toString("utf8"))}`;
    files.set("SKILL.md", Buffer.from(`---
name: ${name}
description: ${JSON.stringify(entry.description)}
---

${body}
`));
    files.set("NED-BUNDLE.json", Buffer.from(JSON.stringify({ schemaVersion: 1, id: entry.id, source: entry.source, commit: entry.commit, license: entry.license, files: entry.files }, null, 2) + "\n"));
    const bytes = archive(files, name);
    packages.push({ id: entry.id, name, description: entry.description, hash: digest(bytes), archive: bytes, body, files, source: entry.source, commit: entry.commit });
  }
  return packages;
}
async function installed(transport, name, signal) {
  try {
    const reply = await transport(`/api/v1/skills/${name}?target_uri=${encodeURIComponent(bundledSkillsRoot)}&include_content=true&include_files=true&include_integrity=true&include_source=true`, { signal });
    const result = reply.result;
    if (typeof result?.revision !== "string" || typeof result?.content !== "string" || !Array.isArray(result?.files)) throw new Error("\uC2A4\uD0AC \uB4F1\uB85D \uACB0\uACFC \uD615\uC2DD \uC624\uB958");
    return result;
  } catch (error) {
    if (error.status === 404) return void 0;
    throw error;
  }
}
function matches(pkg, remote) {
  if (bodyOf(remote.content) !== pkg.body.trim()) return false;
  for (const [name, bytes] of pkg.files) if (name !== "SKILL.md" && remote.files.find((f) => f.path === name)?.sha256 !== digest(bytes)) return false;
  return true;
}
async function registerBundledSkills(options) {
  const { signal, transport } = options;
  const packages = await loadBundledSkillPackages(options.bundle);
  signal.throwIfAborted();
  let saved;
  try {
    saved = JSON.parse(await (0, import_promises11.readFile)(options.stateFile, "utf8"));
    if (saved.schemaVersion !== 1 || !saved.entries || typeof saved.entries !== "object" || Array.isArray(saved.entries) || Object.values(saved.entries).some((e) => typeof e?.bundleHash !== "string" || typeof e?.revision !== "string")) throw new Error("\uAE30\uBCF8 \uC2A4\uD0AC \uB4F1\uB85D \uAE30\uB85D \uD615\uC2DD \uC624\uB958");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    saved = { schemaVersion: 1, entries: {} };
  }
  const state = { status: "registering", registered: 0, total: packages.length, conflicts: [], failed: [], errors: [] };
  const publish = () => options.progress(structuredClone(state));
  publish();
  for (const pkg of packages) {
    signal.throwIfAborted();
    let stage = "lookup";
    const step = (next) => {
      stage = next;
      state.current = { id: pkg.id, stage };
      publish();
    };
    step("lookup");
    try {
      let remote = await installed(transport, pkg.name, signal);
      const record = saved.entries[pkg.id];
      const owner = remote?.source?.ned_owner ?? remote?.source?.[previousSkillOwner];
      const remoteHash = remote?.source?.ned_bundle_sha256 ?? remote?.source?.[previousSkillHash];
      if (remote && (owner !== "bundled-skills" || record && (record.bundleHash !== remoteHash || record.revision !== remote.revision && !matches(pkg, remote)))) {
        state.conflicts.push(pkg.id);
        publish();
        continue;
      }
      if (remote && remote.source?.ned_bundle_sha256 === pkg.hash && !matches(pkg, remote)) {
        state.conflicts.push(pkg.id);
        publish();
        continue;
      }
      if (!remote || remote.source?.ned_bundle_sha256 !== pkg.hash) {
        if (remote && !record) {
          state.conflicts.push(pkg.id);
          publish();
          continue;
        }
        const form = new FormData();
        form.append("file", new Blob([new Uint8Array(pkg.archive)], { type: "application/zip" }), pkg.name + ".zip");
        step("upload");
        const upload = await transport("/api/v1/resources/temp_upload", { method: "POST", body: form, signal });
        const id = upload.result?.temp_file_id;
        if (typeof id !== "string") throw new Error("\uC2A4\uD0AC \uC5C5\uB85C\uB4DC \uD655\uC778 \uC2E4\uD328");
        step("import");
        await transport(remote ? `/api/v1/skills/${pkg.name}` : "/api/v1/skills", { method: remote ? "PUT" : "POST", signal, body: {
          temp_file_id: id,
          wait: true,
          target_uri: bundledSkillsRoot,
          source_metadata: { type: "ned-bundle", source: "offline-bundle", ned_owner: "bundled-skills", ned_bundle_sha256: pkg.hash, ned_id: pkg.id, upstream_source: pkg.source, upstream_commit: pkg.commit }
        } });
        step("verify");
        remote = await installed(transport, pkg.name, signal);
        if (!remote || remote.source?.ned_bundle_sha256 !== pkg.hash || !matches(pkg, remote)) throw Object.assign(new Error("\uB4F1\uB85D\uB41C \uC2A4\uD0AC \uB0B4\uC6A9 \uAC80\uC99D \uC2E4\uD328"), { diagnosticCode: "OV_SKILL_INTEGRITY" });
      }
      step("state");
      saved.entries[pkg.id] = { bundleHash: pkg.hash, revision: remote.revision };
      signal.throwIfAborted();
      await atomicJSON(options.stateFile, saved);
      state.registered++;
    } catch (error) {
      signal.throwIfAborted();
      state.failed.push(pkg.id);
      const status = error?.status;
      const explicit = error?.diagnosticCode;
      state.errors.push({
        id: pkg.id,
        stage,
        code: ["OV_SKILL_INTEGRITY"].includes(explicit ?? "") ? explicit : vikingErrorCode(error instanceof Error ? error.message : ""),
        ...Number.isInteger(status) && status >= 100 && status <= 599 ? { httpStatus: status } : {}
      });
    }
    publish();
  }
  state.current = void 0;
  state.status = state.conflicts.length || state.failed.length ? "error" : "ready";
  state.message = state.status === "ready" ? `OpenViking \uAE30\uBCF8 \uC2A4\uD0AC ${state.registered}\uAC1C \uB4F1\uB85D \uD655\uC778` : `\uAE30\uBCF8 \uC2A4\uD0AC ${state.registered}/${state.total}\uAC1C \uD655\uC778; \uCDA9\uB3CC ${state.conflicts.length}\uAC1C\xB7\uC2E4\uD328 ${state.failed.length}\uAC1C. \uAE30\uC874 \uB0B4\uC6A9\uC740 \uBCF4\uC874\uD558\uBA70 \uB2E4\uC74C \uC2E4\uD589\uC5D0\uC11C \uC7AC\uD655\uC778\uD569\uB2C8\uB2E4.`;
  if (state.errors?.length) state.message += "\n" + state.errors.map((e) => `${e.id}: ${e.stage} ${e.code}${e.httpStatus ? " HTTP " + e.httpStatus : ""}`).join("\n");
  publish();
  return state;
}
var import_node_crypto5, import_promises11, import_node_zlib3, import_node_path11, digest, bundledSkillsRoot, bodyOf;
var init_openviking_skills = __esm({
  "src/main/openviking-skills.ts"() {
    "use strict";
    import_node_crypto5 = require("node:crypto");
    import_promises11 = require("node:fs/promises");
    import_node_zlib3 = require("node:zlib");
    import_node_path11 = __toESM(require("node:path"), 1);
    init_openviking_errors();
    init_config();
    init_openviking_namespace();
    digest = (value) => (0, import_node_crypto5.createHash)("sha256").update(value).digest("hex");
    bundledSkillsRoot = "viking://agent/skills";
    bodyOf = (text) => text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
  }
});

// tests/zed-settings.test.ts
var import_node_test = require("node:test");
var import_strict = __toESM(require("node:assert/strict"), 1);
var import_promises5 = require("node:fs/promises");
var import_node_os = require("node:os");
var import_node_path6 = __toESM(require("node:path"), 1);

// distribution/ned/profile.ts
var import_node_path5 = __toESM(require("node:path"), 1);
var import_promises4 = require("node:fs/promises");

// distribution/ned/zed-settings.ts
init_zod();

// node_modules/jsonc-parser/lib/esm/impl/scanner.js
function createScanner(text, ignoreTrivia = false) {
  const len = text.length;
  let pos = 0, value = "", tokenOffset = 0, token = 16, lineNumber = 0, lineStartOffset = 0, tokenLineStartOffset = 0, prevTokenLineStartOffset = 0, scanError = 0;
  function scanHexDigits(count, exact) {
    let digits = 0;
    let value2 = 0;
    while (digits < count || !exact) {
      let ch = text.charCodeAt(pos);
      if (ch >= 48 && ch <= 57) {
        value2 = value2 * 16 + ch - 48;
      } else if (ch >= 65 && ch <= 70) {
        value2 = value2 * 16 + ch - 65 + 10;
      } else if (ch >= 97 && ch <= 102) {
        value2 = value2 * 16 + ch - 97 + 10;
      } else {
        break;
      }
      pos++;
      digits++;
    }
    if (digits < count) {
      value2 = -1;
    }
    return value2;
  }
  function setPosition(newPosition) {
    pos = newPosition;
    value = "";
    tokenOffset = 0;
    token = 16;
    scanError = 0;
  }
  function scanNumber() {
    let start = pos;
    if (text.charCodeAt(pos) === 48) {
      pos++;
    } else {
      pos++;
      while (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
      }
    }
    if (pos < text.length && text.charCodeAt(pos) === 46) {
      pos++;
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
      } else {
        scanError = 3;
        return text.substring(start, pos);
      }
    }
    let end = pos;
    if (pos < text.length && (text.charCodeAt(pos) === 69 || text.charCodeAt(pos) === 101)) {
      pos++;
      if (pos < text.length && text.charCodeAt(pos) === 43 || text.charCodeAt(pos) === 45) {
        pos++;
      }
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
        end = pos;
      } else {
        scanError = 3;
      }
    }
    return text.substring(start, end);
  }
  function scanString() {
    let result = "", start = pos;
    while (true) {
      if (pos >= len) {
        result += text.substring(start, pos);
        scanError = 2;
        break;
      }
      const ch = text.charCodeAt(pos);
      if (ch === 34) {
        result += text.substring(start, pos);
        pos++;
        break;
      }
      if (ch === 92) {
        result += text.substring(start, pos);
        pos++;
        if (pos >= len) {
          scanError = 2;
          break;
        }
        const ch2 = text.charCodeAt(pos++);
        switch (ch2) {
          case 34:
            result += '"';
            break;
          case 92:
            result += "\\";
            break;
          case 47:
            result += "/";
            break;
          case 98:
            result += "\b";
            break;
          case 102:
            result += "\f";
            break;
          case 110:
            result += "\n";
            break;
          case 114:
            result += "\r";
            break;
          case 116:
            result += "	";
            break;
          case 117:
            const ch3 = scanHexDigits(4, true);
            if (ch3 >= 0) {
              result += String.fromCharCode(ch3);
            } else {
              scanError = 4;
            }
            break;
          default:
            scanError = 5;
        }
        start = pos;
        continue;
      }
      if (ch >= 0 && ch <= 31) {
        if (isLineBreak(ch)) {
          result += text.substring(start, pos);
          scanError = 2;
          break;
        } else {
          scanError = 6;
        }
      }
      pos++;
    }
    return result;
  }
  function scanNext() {
    value = "";
    scanError = 0;
    tokenOffset = pos;
    lineStartOffset = lineNumber;
    prevTokenLineStartOffset = tokenLineStartOffset;
    if (pos >= len) {
      tokenOffset = len;
      return token = 17;
    }
    let code = text.charCodeAt(pos);
    if (isWhiteSpace(code)) {
      do {
        pos++;
        value += String.fromCharCode(code);
        code = text.charCodeAt(pos);
      } while (isWhiteSpace(code));
      return token = 15;
    }
    if (isLineBreak(code)) {
      pos++;
      value += String.fromCharCode(code);
      if (code === 13 && text.charCodeAt(pos) === 10) {
        pos++;
        value += "\n";
      }
      lineNumber++;
      tokenLineStartOffset = pos;
      return token = 14;
    }
    switch (code) {
      // tokens: []{}:,
      case 123:
        pos++;
        return token = 1;
      case 125:
        pos++;
        return token = 2;
      case 91:
        pos++;
        return token = 3;
      case 93:
        pos++;
        return token = 4;
      case 58:
        pos++;
        return token = 6;
      case 44:
        pos++;
        return token = 5;
      // strings
      case 34:
        pos++;
        value = scanString();
        return token = 10;
      // comments
      case 47:
        const start = pos - 1;
        if (text.charCodeAt(pos + 1) === 47) {
          pos += 2;
          while (pos < len) {
            if (isLineBreak(text.charCodeAt(pos))) {
              break;
            }
            pos++;
          }
          value = text.substring(start, pos);
          return token = 12;
        }
        if (text.charCodeAt(pos + 1) === 42) {
          pos += 2;
          const safeLength = len - 1;
          let commentClosed = false;
          while (pos < safeLength) {
            const ch = text.charCodeAt(pos);
            if (ch === 42 && text.charCodeAt(pos + 1) === 47) {
              pos += 2;
              commentClosed = true;
              break;
            }
            pos++;
            if (isLineBreak(ch)) {
              if (ch === 13 && text.charCodeAt(pos) === 10) {
                pos++;
              }
              lineNumber++;
              tokenLineStartOffset = pos;
            }
          }
          if (!commentClosed) {
            pos++;
            scanError = 1;
          }
          value = text.substring(start, pos);
          return token = 13;
        }
        value += String.fromCharCode(code);
        pos++;
        return token = 16;
      // numbers
      case 45:
        value += String.fromCharCode(code);
        pos++;
        if (pos === len || !isDigit(text.charCodeAt(pos))) {
          return token = 16;
        }
      // found a minus, followed by a number so
      // we fall through to proceed with scanning
      // numbers
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        value += scanNumber();
        return token = 11;
      // literals and unknown symbols
      default:
        while (pos < len && isUnknownContentCharacter(code)) {
          pos++;
          code = text.charCodeAt(pos);
        }
        if (tokenOffset !== pos) {
          value = text.substring(tokenOffset, pos);
          switch (value) {
            case "true":
              return token = 8;
            case "false":
              return token = 9;
            case "null":
              return token = 7;
          }
          return token = 16;
        }
        value += String.fromCharCode(code);
        pos++;
        return token = 16;
    }
  }
  function isUnknownContentCharacter(code) {
    if (isWhiteSpace(code) || isLineBreak(code)) {
      return false;
    }
    switch (code) {
      case 125:
      case 93:
      case 123:
      case 91:
      case 34:
      case 58:
      case 44:
      case 47:
        return false;
    }
    return true;
  }
  function scanNextNonTrivia() {
    let result;
    do {
      result = scanNext();
    } while (result >= 12 && result <= 15);
    return result;
  }
  return {
    setPosition,
    getPosition: () => pos,
    scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
    getToken: () => token,
    getTokenValue: () => value,
    getTokenOffset: () => tokenOffset,
    getTokenLength: () => pos - tokenOffset,
    getTokenStartLine: () => lineStartOffset,
    getTokenStartCharacter: () => tokenOffset - prevTokenLineStartOffset,
    getTokenError: () => scanError
  };
}
function isWhiteSpace(ch) {
  return ch === 32 || ch === 9;
}
function isLineBreak(ch) {
  return ch === 10 || ch === 13;
}
function isDigit(ch) {
  return ch >= 48 && ch <= 57;
}
var CharacterCodes;
(function(CharacterCodes2) {
  CharacterCodes2[CharacterCodes2["lineFeed"] = 10] = "lineFeed";
  CharacterCodes2[CharacterCodes2["carriageReturn"] = 13] = "carriageReturn";
  CharacterCodes2[CharacterCodes2["space"] = 32] = "space";
  CharacterCodes2[CharacterCodes2["_0"] = 48] = "_0";
  CharacterCodes2[CharacterCodes2["_1"] = 49] = "_1";
  CharacterCodes2[CharacterCodes2["_2"] = 50] = "_2";
  CharacterCodes2[CharacterCodes2["_3"] = 51] = "_3";
  CharacterCodes2[CharacterCodes2["_4"] = 52] = "_4";
  CharacterCodes2[CharacterCodes2["_5"] = 53] = "_5";
  CharacterCodes2[CharacterCodes2["_6"] = 54] = "_6";
  CharacterCodes2[CharacterCodes2["_7"] = 55] = "_7";
  CharacterCodes2[CharacterCodes2["_8"] = 56] = "_8";
  CharacterCodes2[CharacterCodes2["_9"] = 57] = "_9";
  CharacterCodes2[CharacterCodes2["a"] = 97] = "a";
  CharacterCodes2[CharacterCodes2["b"] = 98] = "b";
  CharacterCodes2[CharacterCodes2["c"] = 99] = "c";
  CharacterCodes2[CharacterCodes2["d"] = 100] = "d";
  CharacterCodes2[CharacterCodes2["e"] = 101] = "e";
  CharacterCodes2[CharacterCodes2["f"] = 102] = "f";
  CharacterCodes2[CharacterCodes2["g"] = 103] = "g";
  CharacterCodes2[CharacterCodes2["h"] = 104] = "h";
  CharacterCodes2[CharacterCodes2["i"] = 105] = "i";
  CharacterCodes2[CharacterCodes2["j"] = 106] = "j";
  CharacterCodes2[CharacterCodes2["k"] = 107] = "k";
  CharacterCodes2[CharacterCodes2["l"] = 108] = "l";
  CharacterCodes2[CharacterCodes2["m"] = 109] = "m";
  CharacterCodes2[CharacterCodes2["n"] = 110] = "n";
  CharacterCodes2[CharacterCodes2["o"] = 111] = "o";
  CharacterCodes2[CharacterCodes2["p"] = 112] = "p";
  CharacterCodes2[CharacterCodes2["q"] = 113] = "q";
  CharacterCodes2[CharacterCodes2["r"] = 114] = "r";
  CharacterCodes2[CharacterCodes2["s"] = 115] = "s";
  CharacterCodes2[CharacterCodes2["t"] = 116] = "t";
  CharacterCodes2[CharacterCodes2["u"] = 117] = "u";
  CharacterCodes2[CharacterCodes2["v"] = 118] = "v";
  CharacterCodes2[CharacterCodes2["w"] = 119] = "w";
  CharacterCodes2[CharacterCodes2["x"] = 120] = "x";
  CharacterCodes2[CharacterCodes2["y"] = 121] = "y";
  CharacterCodes2[CharacterCodes2["z"] = 122] = "z";
  CharacterCodes2[CharacterCodes2["A"] = 65] = "A";
  CharacterCodes2[CharacterCodes2["B"] = 66] = "B";
  CharacterCodes2[CharacterCodes2["C"] = 67] = "C";
  CharacterCodes2[CharacterCodes2["D"] = 68] = "D";
  CharacterCodes2[CharacterCodes2["E"] = 69] = "E";
  CharacterCodes2[CharacterCodes2["F"] = 70] = "F";
  CharacterCodes2[CharacterCodes2["G"] = 71] = "G";
  CharacterCodes2[CharacterCodes2["H"] = 72] = "H";
  CharacterCodes2[CharacterCodes2["I"] = 73] = "I";
  CharacterCodes2[CharacterCodes2["J"] = 74] = "J";
  CharacterCodes2[CharacterCodes2["K"] = 75] = "K";
  CharacterCodes2[CharacterCodes2["L"] = 76] = "L";
  CharacterCodes2[CharacterCodes2["M"] = 77] = "M";
  CharacterCodes2[CharacterCodes2["N"] = 78] = "N";
  CharacterCodes2[CharacterCodes2["O"] = 79] = "O";
  CharacterCodes2[CharacterCodes2["P"] = 80] = "P";
  CharacterCodes2[CharacterCodes2["Q"] = 81] = "Q";
  CharacterCodes2[CharacterCodes2["R"] = 82] = "R";
  CharacterCodes2[CharacterCodes2["S"] = 83] = "S";
  CharacterCodes2[CharacterCodes2["T"] = 84] = "T";
  CharacterCodes2[CharacterCodes2["U"] = 85] = "U";
  CharacterCodes2[CharacterCodes2["V"] = 86] = "V";
  CharacterCodes2[CharacterCodes2["W"] = 87] = "W";
  CharacterCodes2[CharacterCodes2["X"] = 88] = "X";
  CharacterCodes2[CharacterCodes2["Y"] = 89] = "Y";
  CharacterCodes2[CharacterCodes2["Z"] = 90] = "Z";
  CharacterCodes2[CharacterCodes2["asterisk"] = 42] = "asterisk";
  CharacterCodes2[CharacterCodes2["backslash"] = 92] = "backslash";
  CharacterCodes2[CharacterCodes2["closeBrace"] = 125] = "closeBrace";
  CharacterCodes2[CharacterCodes2["closeBracket"] = 93] = "closeBracket";
  CharacterCodes2[CharacterCodes2["colon"] = 58] = "colon";
  CharacterCodes2[CharacterCodes2["comma"] = 44] = "comma";
  CharacterCodes2[CharacterCodes2["dot"] = 46] = "dot";
  CharacterCodes2[CharacterCodes2["doubleQuote"] = 34] = "doubleQuote";
  CharacterCodes2[CharacterCodes2["minus"] = 45] = "minus";
  CharacterCodes2[CharacterCodes2["openBrace"] = 123] = "openBrace";
  CharacterCodes2[CharacterCodes2["openBracket"] = 91] = "openBracket";
  CharacterCodes2[CharacterCodes2["plus"] = 43] = "plus";
  CharacterCodes2[CharacterCodes2["slash"] = 47] = "slash";
  CharacterCodes2[CharacterCodes2["formFeed"] = 12] = "formFeed";
  CharacterCodes2[CharacterCodes2["tab"] = 9] = "tab";
})(CharacterCodes || (CharacterCodes = {}));

// node_modules/jsonc-parser/lib/esm/impl/string-intern.js
var cachedSpaces = new Array(20).fill(0).map((_, index) => {
  return " ".repeat(index);
});
var maxCachedValues = 200;
var cachedBreakLinesWithSpaces = {
  " ": {
    "\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\n" + " ".repeat(index);
    }),
    "\r": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r" + " ".repeat(index);
    }),
    "\r\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r\n" + " ".repeat(index);
    })
  },
  "	": {
    "\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\n" + "	".repeat(index);
    }),
    "\r": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r" + "	".repeat(index);
    }),
    "\r\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r\n" + "	".repeat(index);
    })
  }
};
var supportedEols = ["\n", "\r", "\r\n"];

// node_modules/jsonc-parser/lib/esm/impl/format.js
function format(documentText, range, options) {
  let initialIndentLevel;
  let formatText;
  let formatTextStart;
  let rangeStart;
  let rangeEnd;
  if (range) {
    rangeStart = range.offset;
    rangeEnd = rangeStart + range.length;
    formatTextStart = rangeStart;
    while (formatTextStart > 0 && !isEOL(documentText, formatTextStart - 1)) {
      formatTextStart--;
    }
    let endOffset = rangeEnd;
    while (endOffset < documentText.length && !isEOL(documentText, endOffset)) {
      endOffset++;
    }
    formatText = documentText.substring(formatTextStart, endOffset);
    initialIndentLevel = computeIndentLevel(formatText, options);
  } else {
    formatText = documentText;
    initialIndentLevel = 0;
    formatTextStart = 0;
    rangeStart = 0;
    rangeEnd = documentText.length;
  }
  const eol = getEOL(options, documentText);
  const eolFastPathSupported = supportedEols.includes(eol);
  let numberLineBreaks = 0;
  let indentLevel = 0;
  let indentValue;
  if (options.insertSpaces) {
    indentValue = cachedSpaces[options.tabSize || 4] ?? repeat(cachedSpaces[1], options.tabSize || 4);
  } else {
    indentValue = "	";
  }
  const indentType = indentValue === "	" ? "	" : " ";
  let scanner = createScanner(formatText, false);
  let hasError = false;
  function newLinesAndIndent() {
    if (numberLineBreaks > 1) {
      return repeat(eol, numberLineBreaks) + repeat(indentValue, initialIndentLevel + indentLevel);
    }
    const amountOfSpaces = indentValue.length * (initialIndentLevel + indentLevel);
    if (!eolFastPathSupported || amountOfSpaces > cachedBreakLinesWithSpaces[indentType][eol].length) {
      return eol + repeat(indentValue, initialIndentLevel + indentLevel);
    }
    if (amountOfSpaces <= 0) {
      return eol;
    }
    return cachedBreakLinesWithSpaces[indentType][eol][amountOfSpaces];
  }
  function scanNext() {
    let token = scanner.scan();
    numberLineBreaks = 0;
    while (token === 15 || token === 14) {
      if (token === 14 && options.keepLines) {
        numberLineBreaks += 1;
      } else if (token === 14) {
        numberLineBreaks = 1;
      }
      token = scanner.scan();
    }
    hasError = token === 16 || scanner.getTokenError() !== 0;
    return token;
  }
  const editOperations = [];
  function addEdit(text, startOffset, endOffset) {
    if (!hasError && (!range || startOffset < rangeEnd && endOffset > rangeStart) && documentText.substring(startOffset, endOffset) !== text) {
      editOperations.push({ offset: startOffset, length: endOffset - startOffset, content: text });
    }
  }
  let firstToken = scanNext();
  if (options.keepLines && numberLineBreaks > 0) {
    addEdit(repeat(eol, numberLineBreaks), 0, 0);
  }
  if (firstToken !== 17) {
    let firstTokenStart = scanner.getTokenOffset() + formatTextStart;
    let initialIndent = indentValue.length * initialIndentLevel < 20 && options.insertSpaces ? cachedSpaces[indentValue.length * initialIndentLevel] : repeat(indentValue, initialIndentLevel);
    addEdit(initialIndent, formatTextStart, firstTokenStart);
  }
  while (firstToken !== 17) {
    let firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
    let secondToken = scanNext();
    let replaceContent = "";
    let needsLineBreak = false;
    while (numberLineBreaks === 0 && (secondToken === 12 || secondToken === 13)) {
      let commentTokenStart = scanner.getTokenOffset() + formatTextStart;
      addEdit(cachedSpaces[1], firstTokenEnd, commentTokenStart);
      firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
      needsLineBreak = secondToken === 12;
      replaceContent = needsLineBreak ? newLinesAndIndent() : "";
      secondToken = scanNext();
    }
    if (secondToken === 2) {
      if (firstToken !== 1) {
        indentLevel--;
      }
      ;
      if (options.keepLines && numberLineBreaks > 0 || !options.keepLines && firstToken !== 1) {
        replaceContent = newLinesAndIndent();
      } else if (options.keepLines) {
        replaceContent = cachedSpaces[1];
      }
    } else if (secondToken === 4) {
      if (firstToken !== 3) {
        indentLevel--;
      }
      ;
      if (options.keepLines && numberLineBreaks > 0 || !options.keepLines && firstToken !== 3) {
        replaceContent = newLinesAndIndent();
      } else if (options.keepLines) {
        replaceContent = cachedSpaces[1];
      }
    } else {
      switch (firstToken) {
        case 3:
        case 1:
          indentLevel++;
          if (options.keepLines && numberLineBreaks > 0 || !options.keepLines) {
            replaceContent = newLinesAndIndent();
          } else {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 5:
          if (options.keepLines && numberLineBreaks > 0 || !options.keepLines) {
            replaceContent = newLinesAndIndent();
          } else {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 12:
          replaceContent = newLinesAndIndent();
          break;
        case 13:
          if (numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else if (!needsLineBreak) {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 6:
          if (options.keepLines && numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else if (!needsLineBreak) {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 10:
          if (options.keepLines && numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else if (secondToken === 6 && !needsLineBreak) {
            replaceContent = "";
          }
          break;
        case 7:
        case 8:
        case 9:
        case 11:
        case 2:
        case 4:
          if (options.keepLines && numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else {
            if ((secondToken === 12 || secondToken === 13) && !needsLineBreak) {
              replaceContent = cachedSpaces[1];
            } else if (secondToken !== 5 && secondToken !== 17) {
              hasError = true;
            }
          }
          break;
        case 16:
          hasError = true;
          break;
      }
      if (numberLineBreaks > 0 && (secondToken === 12 || secondToken === 13)) {
        replaceContent = newLinesAndIndent();
      }
    }
    if (secondToken === 17) {
      if (options.keepLines && numberLineBreaks > 0) {
        replaceContent = newLinesAndIndent();
      } else {
        replaceContent = options.insertFinalNewline ? eol : "";
      }
    }
    const secondTokenStart = scanner.getTokenOffset() + formatTextStart;
    addEdit(replaceContent, firstTokenEnd, secondTokenStart);
    firstToken = secondToken;
  }
  return editOperations;
}
function repeat(s, count) {
  let result = "";
  for (let i = 0; i < count; i++) {
    result += s;
  }
  return result;
}
function computeIndentLevel(content, options) {
  let i = 0;
  let nChars = 0;
  const tabSize = options.tabSize || 4;
  while (i < content.length) {
    let ch = content.charAt(i);
    if (ch === cachedSpaces[1]) {
      nChars++;
    } else if (ch === "	") {
      nChars += tabSize;
    } else {
      break;
    }
    i++;
  }
  return Math.floor(nChars / tabSize);
}
function getEOL(options, text) {
  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i);
    if (ch === "\r") {
      if (i + 1 < text.length && text.charAt(i + 1) === "\n") {
        return "\r\n";
      }
      return "\r";
    } else if (ch === "\n") {
      return "\n";
    }
  }
  return options && options.eol || "\n";
}
function isEOL(text, offset) {
  return "\r\n".indexOf(text.charAt(offset)) !== -1;
}

// node_modules/jsonc-parser/lib/esm/impl/parser.js
var ParseOptions;
(function(ParseOptions2) {
  ParseOptions2.DEFAULT = {
    allowTrailingComma: false
  };
})(ParseOptions || (ParseOptions = {}));
function parse(text, errors = [], options = ParseOptions.DEFAULT) {
  let currentProperty = null;
  let currentParent = [];
  const previousParents = [];
  function onValue(value) {
    if (Array.isArray(currentParent)) {
      currentParent.push(value);
    } else if (currentProperty !== null) {
      currentParent[currentProperty] = value;
    }
  }
  const visitor = {
    onObjectBegin: () => {
      const object2 = {};
      onValue(object2);
      previousParents.push(currentParent);
      currentParent = object2;
      currentProperty = null;
    },
    onObjectProperty: (name) => {
      currentProperty = name;
    },
    onObjectEnd: () => {
      currentParent = previousParents.pop();
    },
    onArrayBegin: () => {
      const array = [];
      onValue(array);
      previousParents.push(currentParent);
      currentParent = array;
      currentProperty = null;
    },
    onArrayEnd: () => {
      currentParent = previousParents.pop();
    },
    onLiteralValue: onValue,
    onError: (error, offset, length) => {
      errors.push({ error, offset, length });
    }
  };
  visit(text, visitor, options);
  return currentParent[0];
}
function parseTree(text, errors = [], options = ParseOptions.DEFAULT) {
  let currentParent = { type: "array", offset: -1, length: -1, children: [], parent: void 0 };
  function ensurePropertyComplete(endOffset) {
    if (currentParent.type === "property") {
      currentParent.length = endOffset - currentParent.offset;
      currentParent = currentParent.parent;
    }
  }
  function onValue(valueNode) {
    currentParent.children.push(valueNode);
    return valueNode;
  }
  const visitor = {
    onObjectBegin: (offset) => {
      currentParent = onValue({ type: "object", offset, length: -1, parent: currentParent, children: [] });
    },
    onObjectProperty: (name, offset, length) => {
      currentParent = onValue({ type: "property", offset, length: -1, parent: currentParent, children: [] });
      currentParent.children.push({ type: "string", value: name, offset, length, parent: currentParent });
    },
    onObjectEnd: (offset, length) => {
      ensurePropertyComplete(offset + length);
      currentParent.length = offset + length - currentParent.offset;
      currentParent = currentParent.parent;
      ensurePropertyComplete(offset + length);
    },
    onArrayBegin: (offset, length) => {
      currentParent = onValue({ type: "array", offset, length: -1, parent: currentParent, children: [] });
    },
    onArrayEnd: (offset, length) => {
      currentParent.length = offset + length - currentParent.offset;
      currentParent = currentParent.parent;
      ensurePropertyComplete(offset + length);
    },
    onLiteralValue: (value, offset, length) => {
      onValue({ type: getNodeType(value), offset, length, parent: currentParent, value });
      ensurePropertyComplete(offset + length);
    },
    onSeparator: (sep, offset, length) => {
      if (currentParent.type === "property") {
        if (sep === ":") {
          currentParent.colonOffset = offset;
        } else if (sep === ",") {
          ensurePropertyComplete(offset);
        }
      }
    },
    onError: (error, offset, length) => {
      errors.push({ error, offset, length });
    }
  };
  visit(text, visitor, options);
  const result = currentParent.children[0];
  if (result) {
    delete result.parent;
  }
  return result;
}
function findNodeAtLocation(root, path20) {
  if (!root) {
    return void 0;
  }
  let node = root;
  for (let segment of path20) {
    if (typeof segment === "string") {
      if (node.type !== "object" || !Array.isArray(node.children)) {
        return void 0;
      }
      let found = false;
      for (const propertyNode of node.children) {
        if (Array.isArray(propertyNode.children) && propertyNode.children[0].value === segment && propertyNode.children.length === 2) {
          node = propertyNode.children[1];
          found = true;
          break;
        }
      }
      if (!found) {
        return void 0;
      }
    } else {
      const index = segment;
      if (node.type !== "array" || index < 0 || !Array.isArray(node.children) || index >= node.children.length) {
        return void 0;
      }
      node = node.children[index];
    }
  }
  return node;
}
function visit(text, visitor, options = ParseOptions.DEFAULT) {
  const _scanner = createScanner(text, false);
  const _jsonPath = [];
  let suppressedCallbacks = 0;
  function toNoArgVisit(visitFunction) {
    return visitFunction ? () => suppressedCallbacks === 0 && visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
  }
  function toOneArgVisit(visitFunction) {
    return visitFunction ? (arg) => suppressedCallbacks === 0 && visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
  }
  function toOneArgVisitWithPath(visitFunction) {
    return visitFunction ? (arg) => suppressedCallbacks === 0 && visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice()) : () => true;
  }
  function toBeginVisit(visitFunction) {
    return visitFunction ? () => {
      if (suppressedCallbacks > 0) {
        suppressedCallbacks++;
      } else {
        let cbReturn = visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice());
        if (cbReturn === false) {
          suppressedCallbacks = 1;
        }
      }
    } : () => true;
  }
  function toEndVisit(visitFunction) {
    return visitFunction ? () => {
      if (suppressedCallbacks > 0) {
        suppressedCallbacks--;
      }
      if (suppressedCallbacks === 0) {
        visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter());
      }
    } : () => true;
  }
  const onObjectBegin = toBeginVisit(visitor.onObjectBegin), onObjectProperty = toOneArgVisitWithPath(visitor.onObjectProperty), onObjectEnd = toEndVisit(visitor.onObjectEnd), onArrayBegin = toBeginVisit(visitor.onArrayBegin), onArrayEnd = toEndVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisitWithPath(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
  const disallowComments = options && options.disallowComments;
  const allowTrailingComma = options && options.allowTrailingComma;
  function scanNext() {
    while (true) {
      const token = _scanner.scan();
      switch (_scanner.getTokenError()) {
        case 4:
          handleError(
            14
            /* ParseErrorCode.InvalidUnicode */
          );
          break;
        case 5:
          handleError(
            15
            /* ParseErrorCode.InvalidEscapeCharacter */
          );
          break;
        case 3:
          handleError(
            13
            /* ParseErrorCode.UnexpectedEndOfNumber */
          );
          break;
        case 1:
          if (!disallowComments) {
            handleError(
              11
              /* ParseErrorCode.UnexpectedEndOfComment */
            );
          }
          break;
        case 2:
          handleError(
            12
            /* ParseErrorCode.UnexpectedEndOfString */
          );
          break;
        case 6:
          handleError(
            16
            /* ParseErrorCode.InvalidCharacter */
          );
          break;
      }
      switch (token) {
        case 12:
        case 13:
          if (disallowComments) {
            handleError(
              10
              /* ParseErrorCode.InvalidCommentToken */
            );
          } else {
            onComment();
          }
          break;
        case 16:
          handleError(
            1
            /* ParseErrorCode.InvalidSymbol */
          );
          break;
        case 15:
        case 14:
          break;
        default:
          return token;
      }
    }
  }
  function handleError(error, skipUntilAfter = [], skipUntil = []) {
    onError(error);
    if (skipUntilAfter.length + skipUntil.length > 0) {
      let token = _scanner.getToken();
      while (token !== 17) {
        if (skipUntilAfter.indexOf(token) !== -1) {
          scanNext();
          break;
        } else if (skipUntil.indexOf(token) !== -1) {
          break;
        }
        token = scanNext();
      }
    }
  }
  function parseString(isValue) {
    const value = _scanner.getTokenValue();
    if (isValue) {
      onLiteralValue(value);
    } else {
      onObjectProperty(value);
      _jsonPath.push(value);
    }
    scanNext();
    return true;
  }
  function parseLiteral() {
    switch (_scanner.getToken()) {
      case 11:
        const tokenValue = _scanner.getTokenValue();
        let value = Number(tokenValue);
        if (isNaN(value)) {
          handleError(
            2
            /* ParseErrorCode.InvalidNumberFormat */
          );
          value = 0;
        }
        onLiteralValue(value);
        break;
      case 7:
        onLiteralValue(null);
        break;
      case 8:
        onLiteralValue(true);
        break;
      case 9:
        onLiteralValue(false);
        break;
      default:
        return false;
    }
    scanNext();
    return true;
  }
  function parseProperty() {
    if (_scanner.getToken() !== 10) {
      handleError(3, [], [
        2,
        5
        /* SyntaxKind.CommaToken */
      ]);
      return false;
    }
    parseString(false);
    if (_scanner.getToken() === 6) {
      onSeparator(":");
      scanNext();
      if (!parseValue()) {
        handleError(4, [], [
          2,
          5
          /* SyntaxKind.CommaToken */
        ]);
      }
    } else {
      handleError(5, [], [
        2,
        5
        /* SyntaxKind.CommaToken */
      ]);
    }
    _jsonPath.pop();
    return true;
  }
  function parseObject() {
    onObjectBegin();
    scanNext();
    let needsComma = false;
    while (_scanner.getToken() !== 2 && _scanner.getToken() !== 17) {
      if (_scanner.getToken() === 5) {
        if (!needsComma) {
          handleError(4, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 2 && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6, [], []);
      }
      if (!parseProperty()) {
        handleError(4, [], [
          2,
          5
          /* SyntaxKind.CommaToken */
        ]);
      }
      needsComma = true;
    }
    onObjectEnd();
    if (_scanner.getToken() !== 2) {
      handleError(7, [
        2
        /* SyntaxKind.CloseBraceToken */
      ], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseArray() {
    onArrayBegin();
    scanNext();
    let isFirstElement = true;
    let needsComma = false;
    while (_scanner.getToken() !== 4 && _scanner.getToken() !== 17) {
      if (_scanner.getToken() === 5) {
        if (!needsComma) {
          handleError(4, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 4 && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6, [], []);
      }
      if (isFirstElement) {
        _jsonPath.push(0);
        isFirstElement = false;
      } else {
        _jsonPath[_jsonPath.length - 1]++;
      }
      if (!parseValue()) {
        handleError(4, [], [
          4,
          5
          /* SyntaxKind.CommaToken */
        ]);
      }
      needsComma = true;
    }
    onArrayEnd();
    if (!isFirstElement) {
      _jsonPath.pop();
    }
    if (_scanner.getToken() !== 4) {
      handleError(8, [
        4
        /* SyntaxKind.CloseBracketToken */
      ], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseValue() {
    switch (_scanner.getToken()) {
      case 3:
        return parseArray();
      case 1:
        return parseObject();
      case 10:
        return parseString(true);
      default:
        return parseLiteral();
    }
  }
  scanNext();
  if (_scanner.getToken() === 17) {
    if (options.allowEmptyContent) {
      return true;
    }
    handleError(4, [], []);
    return false;
  }
  if (!parseValue()) {
    handleError(4, [], []);
    return false;
  }
  if (_scanner.getToken() !== 17) {
    handleError(9, [], []);
  }
  return true;
}
function getNodeType(value) {
  switch (typeof value) {
    case "boolean":
      return "boolean";
    case "number":
      return "number";
    case "string":
      return "string";
    case "object": {
      if (!value) {
        return "null";
      } else if (Array.isArray(value)) {
        return "array";
      }
      return "object";
    }
    default:
      return "null";
  }
}

// node_modules/jsonc-parser/lib/esm/impl/edit.js
function setProperty(text, originalPath, value, options) {
  const path20 = originalPath.slice();
  const errors = [];
  const root = parseTree(text, errors);
  let parent = void 0;
  let lastSegment = void 0;
  while (path20.length > 0) {
    lastSegment = path20.pop();
    parent = findNodeAtLocation(root, path20);
    if (parent === void 0 && value !== void 0) {
      if (typeof lastSegment === "string") {
        value = { [lastSegment]: value };
      } else {
        value = [value];
      }
    } else {
      break;
    }
  }
  if (!parent) {
    if (value === void 0) {
      throw new Error("Can not delete in empty document");
    }
    return withFormatting(text, { offset: root ? root.offset : 0, length: root ? root.length : 0, content: JSON.stringify(value) }, options);
  } else if (parent.type === "object" && typeof lastSegment === "string" && Array.isArray(parent.children)) {
    const existing = findNodeAtLocation(parent, [lastSegment]);
    if (existing !== void 0) {
      if (value === void 0) {
        if (!existing.parent) {
          throw new Error("Malformed AST");
        }
        const propertyIndex = parent.children.indexOf(existing.parent);
        let removeBegin;
        let removeEnd = existing.parent.offset + existing.parent.length;
        if (propertyIndex > 0) {
          let previous = parent.children[propertyIndex - 1];
          removeBegin = previous.offset + previous.length;
        } else {
          removeBegin = parent.offset + 1;
          if (parent.children.length > 1) {
            let next = parent.children[1];
            removeEnd = next.offset;
          }
        }
        return withFormatting(text, { offset: removeBegin, length: removeEnd - removeBegin, content: "" }, options);
      } else {
        return withFormatting(text, { offset: existing.offset, length: existing.length, content: JSON.stringify(value) }, options);
      }
    } else {
      if (value === void 0) {
        return [];
      }
      const newProperty = `${JSON.stringify(lastSegment)}: ${JSON.stringify(value)}`;
      const index = options.getInsertionIndex ? options.getInsertionIndex(parent.children.map((p) => p.children[0].value)) : parent.children.length;
      let edit;
      if (index > 0) {
        let previous = parent.children[index - 1];
        edit = { offset: previous.offset + previous.length, length: 0, content: "," + newProperty };
      } else if (parent.children.length === 0) {
        edit = { offset: parent.offset + 1, length: 0, content: newProperty };
      } else {
        edit = { offset: parent.offset + 1, length: 0, content: newProperty + "," };
      }
      return withFormatting(text, edit, options);
    }
  } else if (parent.type === "array" && typeof lastSegment === "number" && Array.isArray(parent.children)) {
    const insertIndex = lastSegment;
    if (insertIndex === -1) {
      const newProperty = `${JSON.stringify(value)}`;
      let edit;
      if (parent.children.length === 0) {
        edit = { offset: parent.offset + 1, length: 0, content: newProperty };
      } else {
        const previous = parent.children[parent.children.length - 1];
        edit = { offset: previous.offset + previous.length, length: 0, content: "," + newProperty };
      }
      return withFormatting(text, edit, options);
    } else if (value === void 0 && parent.children.length >= 0) {
      const removalIndex = lastSegment;
      const toRemove = parent.children[removalIndex];
      let edit;
      if (parent.children.length === 1) {
        edit = { offset: parent.offset + 1, length: parent.length - 2, content: "" };
      } else if (parent.children.length - 1 === removalIndex) {
        let previous = parent.children[removalIndex - 1];
        let offset = previous.offset + previous.length;
        let parentEndOffset = parent.offset + parent.length;
        edit = { offset, length: parentEndOffset - 2 - offset, content: "" };
      } else {
        edit = { offset: toRemove.offset, length: parent.children[removalIndex + 1].offset - toRemove.offset, content: "" };
      }
      return withFormatting(text, edit, options);
    } else if (value !== void 0) {
      let edit;
      const newProperty = `${JSON.stringify(value)}`;
      if (!options.isArrayInsertion && parent.children.length > lastSegment) {
        const toModify = parent.children[lastSegment];
        edit = { offset: toModify.offset, length: toModify.length, content: newProperty };
      } else if (parent.children.length === 0 || lastSegment === 0) {
        edit = { offset: parent.offset + 1, length: 0, content: parent.children.length === 0 ? newProperty : newProperty + "," };
      } else {
        const index = lastSegment > parent.children.length ? parent.children.length : lastSegment;
        const previous = parent.children[index - 1];
        edit = { offset: previous.offset + previous.length, length: 0, content: "," + newProperty };
      }
      return withFormatting(text, edit, options);
    } else {
      throw new Error(`Can not ${value === void 0 ? "remove" : options.isArrayInsertion ? "insert" : "modify"} Array index ${insertIndex} as length is not sufficient`);
    }
  } else {
    throw new Error(`Can not add ${typeof lastSegment !== "number" ? "index" : "property"} to parent of type ${parent.type}`);
  }
}
function withFormatting(text, edit, options) {
  if (!options.formattingOptions) {
    return [edit];
  }
  let newText = applyEdit(text, edit);
  let begin = edit.offset;
  let end = edit.offset + edit.content.length;
  if (edit.length === 0 || edit.content.length === 0) {
    while (begin > 0 && !isEOL(newText, begin - 1)) {
      begin--;
    }
    while (end < newText.length && !isEOL(newText, end)) {
      end++;
    }
  }
  const edits = format(newText, { offset: begin, length: end - begin }, { ...options.formattingOptions, keepLines: false });
  for (let i = edits.length - 1; i >= 0; i--) {
    const edit2 = edits[i];
    newText = applyEdit(newText, edit2);
    begin = Math.min(begin, edit2.offset);
    end = Math.max(end, edit2.offset + edit2.length);
    end += edit2.content.length - edit2.length;
  }
  const editLength = text.length - (newText.length - end) - begin;
  return [{ offset: begin, length: editLength, content: newText.substring(begin, end) }];
}
function applyEdit(text, edit) {
  return text.substring(0, edit.offset) + edit.content + text.substring(edit.offset + edit.length);
}

// node_modules/jsonc-parser/lib/esm/main.js
var ScanError;
(function(ScanError2) {
  ScanError2[ScanError2["None"] = 0] = "None";
  ScanError2[ScanError2["UnexpectedEndOfComment"] = 1] = "UnexpectedEndOfComment";
  ScanError2[ScanError2["UnexpectedEndOfString"] = 2] = "UnexpectedEndOfString";
  ScanError2[ScanError2["UnexpectedEndOfNumber"] = 3] = "UnexpectedEndOfNumber";
  ScanError2[ScanError2["InvalidUnicode"] = 4] = "InvalidUnicode";
  ScanError2[ScanError2["InvalidEscapeCharacter"] = 5] = "InvalidEscapeCharacter";
  ScanError2[ScanError2["InvalidCharacter"] = 6] = "InvalidCharacter";
})(ScanError || (ScanError = {}));
var SyntaxKind;
(function(SyntaxKind2) {
  SyntaxKind2[SyntaxKind2["OpenBraceToken"] = 1] = "OpenBraceToken";
  SyntaxKind2[SyntaxKind2["CloseBraceToken"] = 2] = "CloseBraceToken";
  SyntaxKind2[SyntaxKind2["OpenBracketToken"] = 3] = "OpenBracketToken";
  SyntaxKind2[SyntaxKind2["CloseBracketToken"] = 4] = "CloseBracketToken";
  SyntaxKind2[SyntaxKind2["CommaToken"] = 5] = "CommaToken";
  SyntaxKind2[SyntaxKind2["ColonToken"] = 6] = "ColonToken";
  SyntaxKind2[SyntaxKind2["NullKeyword"] = 7] = "NullKeyword";
  SyntaxKind2[SyntaxKind2["TrueKeyword"] = 8] = "TrueKeyword";
  SyntaxKind2[SyntaxKind2["FalseKeyword"] = 9] = "FalseKeyword";
  SyntaxKind2[SyntaxKind2["StringLiteral"] = 10] = "StringLiteral";
  SyntaxKind2[SyntaxKind2["NumericLiteral"] = 11] = "NumericLiteral";
  SyntaxKind2[SyntaxKind2["LineCommentTrivia"] = 12] = "LineCommentTrivia";
  SyntaxKind2[SyntaxKind2["BlockCommentTrivia"] = 13] = "BlockCommentTrivia";
  SyntaxKind2[SyntaxKind2["LineBreakTrivia"] = 14] = "LineBreakTrivia";
  SyntaxKind2[SyntaxKind2["Trivia"] = 15] = "Trivia";
  SyntaxKind2[SyntaxKind2["Unknown"] = 16] = "Unknown";
  SyntaxKind2[SyntaxKind2["EOF"] = 17] = "EOF";
})(SyntaxKind || (SyntaxKind = {}));
var parse2 = parse;
var parseTree2 = parseTree;
var ParseErrorCode;
(function(ParseErrorCode2) {
  ParseErrorCode2[ParseErrorCode2["InvalidSymbol"] = 1] = "InvalidSymbol";
  ParseErrorCode2[ParseErrorCode2["InvalidNumberFormat"] = 2] = "InvalidNumberFormat";
  ParseErrorCode2[ParseErrorCode2["PropertyNameExpected"] = 3] = "PropertyNameExpected";
  ParseErrorCode2[ParseErrorCode2["ValueExpected"] = 4] = "ValueExpected";
  ParseErrorCode2[ParseErrorCode2["ColonExpected"] = 5] = "ColonExpected";
  ParseErrorCode2[ParseErrorCode2["CommaExpected"] = 6] = "CommaExpected";
  ParseErrorCode2[ParseErrorCode2["CloseBraceExpected"] = 7] = "CloseBraceExpected";
  ParseErrorCode2[ParseErrorCode2["CloseBracketExpected"] = 8] = "CloseBracketExpected";
  ParseErrorCode2[ParseErrorCode2["EndOfFileExpected"] = 9] = "EndOfFileExpected";
  ParseErrorCode2[ParseErrorCode2["InvalidCommentToken"] = 10] = "InvalidCommentToken";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfComment"] = 11] = "UnexpectedEndOfComment";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfString"] = 12] = "UnexpectedEndOfString";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfNumber"] = 13] = "UnexpectedEndOfNumber";
  ParseErrorCode2[ParseErrorCode2["InvalidUnicode"] = 14] = "InvalidUnicode";
  ParseErrorCode2[ParseErrorCode2["InvalidEscapeCharacter"] = 15] = "InvalidEscapeCharacter";
  ParseErrorCode2[ParseErrorCode2["InvalidCharacter"] = 16] = "InvalidCharacter";
})(ParseErrorCode || (ParseErrorCode = {}));
function modify(text, path20, value, options) {
  return setProperty(text, path20, value, options);
}
function applyEdits(text, edits) {
  let sortedEdits = edits.slice(0).sort((a, b) => {
    const diff = a.offset - b.offset;
    if (diff === 0) {
      return a.length - b.length;
    }
    return diff;
  });
  let lastModifiedOffset = text.length;
  for (let i = sortedEdits.length - 1; i >= 0; i--) {
    let e = sortedEdits[i];
    if (e.offset + e.length <= lastModifiedOffset) {
      text = applyEdit(text, e);
    } else {
      throw new Error("Overlapping edit");
    }
    lastModifiedOffset = e.offset;
  }
  return text;
}

// distribution/ned/zed-settings.ts
var profile = external_exports.object({ name: external_exports.string().min(1), tools: external_exports.record(external_exports.boolean()).optional(), enable_all_context_servers: external_exports.boolean().optional(), context_servers: external_exports.record(external_exports.unknown()).optional() }).passthrough();
var model = external_exports.object({ name: external_exports.string().min(1), max_tokens: external_exports.number().int().positive(), capabilities: external_exports.object({ tools: external_exports.boolean(), images: external_exports.boolean(), parallel_tool_calls: external_exports.boolean(), prompt_cache_key: external_exports.boolean(), chat_completions: external_exports.boolean(), interleaved_reasoning: external_exports.boolean(), max_tokens_parameter: external_exports.boolean() }).passthrough() }).passthrough();
var settings = external_exports.object({ agent: external_exports.object({ profiles: external_exports.record(profile).optional() }).passthrough(), language_models: external_exports.object({ openai_compatible: external_exports.record(external_exports.object({ api_url: external_exports.string().url(), available_models: external_exports.array(model).min(1) }).passthrough()) }).passthrough().optional() }).passthrough();
function validateManagedZedSettings(text) {
  const errors = [];
  const data = parse2(text.replace(/^\ufeff/, ""), errors, { allowTrailingComma: true });
  if (errors.length) throw Error("Zed \uC124\uC815 JSONC \uD615\uC2DD \uC624\uB958. \uAE30\uC874 \uC124\uC815\uC740 \uBCF4\uC874\uD588\uC2B5\uB2C8\uB2E4.");
  const result = settings.safeParse(data);
  if (!result.success) throw Error("ZED_SETTINGS_SCHEMA: " + result.error.issues.slice(0, 5).map((i) => i.path.join(".")).join(", "));
}

// distribution/ned/terminal.ts
var import_node_path2 = __toESM(require("node:path"), 1);
var import_promises2 = require("node:fs/promises");

// distribution/ned/editor-preferences.ts
var import_node_path = __toESM(require("node:path"), 1);
var import_promises = require("node:fs/promises");
var import_node_crypto = require("node:crypto");
var uiKeys = /* @__PURE__ */ new Set([
  "theme",
  "icon_theme",
  "buffer_font_family",
  "buffer_font_fallbacks",
  "buffer_font_size",
  "buffer_font_weight",
  "buffer_font_features",
  "buffer_line_height",
  "agent_ui_font_family",
  "agent_ui_font_size",
  "agent_buffer_font_family",
  "agent_buffer_font_size",
  "git_commit_buffer_font_size",
  "mermaid_font_family",
  "ui_font_family",
  "ui_font_fallbacks",
  "ui_font_size",
  "ui_font_weight",
  "ui_font_features",
  "tab_size",
  "hard_tabs",
  "vim_mode",
  "base_keymap",
  "relative_line_numbers",
  "preferred_line_length",
  "soft_wrap",
  "show_whitespaces",
  "cursor_blink",
  "cursor_shape",
  "scrollbar",
  "gutter",
  "minimap",
  "indent_guides",
  "project_panel",
  "outline_panel",
  "git_panel",
  "tab_bar",
  "status_bar",
  "tabs",
  "toolbar",
  "centered_layout",
  "window_decorations",
  "use_system_window_tabs",
  "autosave",
  "auto_signature_help",
  "hover_popover_enabled",
  "inlay_hints",
  "inlay_hints_modifiers",
  "multi_cursor_modifier",
  "seed_search_query_from_cursor"
]);
var nestedUI = {
  agent: ["dock", "button", "flexible", "default_width", "default_height", "max_content_width", "threads_sidebar", "expand_edit_card", "expand_terminal_card", "thinking_display", "use_modifier_to_send", "message_editor_min_lines", "show_turn_stats", "show_merge_conflict_indicator", "notify_when_agent_waiting", "play_sound_when_agent_done", "prevent_idle_sleep"],
  collaboration_panel: ["dock", "default_width", "default_height"],
  notification_panel: ["dock", "default_width", "default_height"],
  title_bar: ["show_branch_name", "show_project_items", "show_menus", "show_project_name", "show_user_picture"],
  terminal: ["dock", "button", "default_width", "default_height", "font_family", "font_fallbacks", "font_size", "font_features", "font_weight", "line_height", "cursor_shape", "blinking", "scrollbar"]
};
var languageUI = ["tab_size", "hard_tabs", "preferred_line_length", "soft_wrap", "show_whitespaces", "inlay_hints", "indent_guides"];
var object = (value) => !!value && typeof value === "object" && !Array.isArray(value);
function decode(text, name) {
  text = text.replace(/^\ufeff/, "");
  const errors = [];
  const value = parse2(text, errors, { allowTrailingComma: true, allowEmptyContent: true });
  const tree = parseTree2(text, [], { allowTrailingComma: true, allowEmptyContent: true });
  let duplicate = false;
  const visit2 = (node) => {
    if (!node) return;
    if (node.type === "object") {
      const names = node.children?.map((p) => p.children[0].value) ?? [];
      if (new Set(names).size !== names.length) duplicate = true;
    }
    node.children?.forEach(visit2);
  };
  visit2(tree);
  if (value === void 0 && !errors.length) return {};
  if (errors.length || duplicate || !object(value)) throw new Error(`\uD3B8\uC9D1\uAE30 ${name} \uC124\uC815\uC758 JSONC \uBB38\uBC95\uC744 \uD655\uC778\uD558\uC138\uC694. \uAE30\uC874 \uD30C\uC77C\uC744 \uBCF4\uC874\uD588\uC2B5\uB2C8\uB2E4.`);
  return value;
}
async function readOwned(file) {
  const info = await (0, import_promises.lstat)(file).catch((error) => {
    if (error.code === "ENOENT") return void 0;
    throw error;
  });
  if (!info) return void 0;
  if (!info.isFile() || info.isSymbolicLink() || info.size > 2 * 1024 * 1024) throw new Error("\uD3B8\uC9D1\uAE30 \uC124\uC815\uC740 \uC571 \uC18C\uC720 \uD3F4\uB354\uC758 \uC77C\uBC18 \uD30C\uC77C\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.");
  return (0, import_promises.readFile)(file, "utf8");
}
async function editorPreferences(data, managed) {
  const file = import_node_path.default.join(data, "config/settings.json"), original = await readOwned(file);
  const legacy = original === void 0 ? await readOwned(import_node_path.default.join(data, "appearance.json")) : void 0;
  const saved = original === void 0 ? {} : decode(original, "settings.json");
  const fallback = legacy === void 0 ? {} : decode(legacy, "appearance.json");
  const chosen = original === void 0 ? fallback : saved;
  const desired = /* @__PURE__ */ Object.create(null);
  for (const key of uiKeys) if (Object.hasOwn(chosen, key)) desired[key] = chosen[key];
  for (const [group, keys] of Object.entries(nestedUI)) if (object(chosen[group])) {
    desired[group] = Object.fromEntries(keys.filter((key) => Object.hasOwn(chosen[group], key)).map((key) => [key, chosen[group][key]]));
  }
  if (object(chosen.languages)) desired.languages = Object.fromEntries(Object.entries(chosen.languages).filter(([, v]) => object(v)).map(([name, v]) => [name, Object.fromEntries(languageUI.filter((k) => Object.hasOwn(v, k)).map((k) => [k, v[k]]))]));
  for (const [key, value] of Object.entries(managed)) {
    if (key === "restore_on_startup" && ["none", "empty_tab", "last_workspace", "last_session", "launchpad"].includes(chosen[key])) desired[key] = chosen[key];
    else if (key === "languages") {
      desired.languages ??= {};
      for (const [language, settings2] of Object.entries(value)) desired.languages[language] = { ...desired.languages[language], ...settings2 };
    } else desired[key] = object(value) ? { ...desired[key], ...value } : value;
  }
  if (supportedTerminal(chosen.terminal?.shell)) {
    desired.terminal ??= {};
    desired.terminal.shell = chosen.terminal.shell;
  }
  const native = managed.language_models?.openai_compatible?.Intranet;
  if (native && chosen.language_models?.openai_compatible?.Intranet && object(chosen.agent)) {
    if (["write", "ask", "minimal"].includes(chosen.agent.default_profile)) desired.agent.default_profile = chosen.agent.default_profile;
    const selected = chosen.agent.default_model;
    if (object(selected) && selected.provider === "Intranet" && native.available_models.some((m) => m.name === selected.model))
      desired.agent.default_model = Object.fromEntries(["provider", "model", "enable_thinking", "effort", "speed"].filter((k) => Object.hasOwn(selected, k)).map((k) => [k, selected[k]]));
  }
  const bom = original?.startsWith("\uFEFF") ? "\uFEFF" : "";
  let updated = (original ?? "{}\n").slice(bom.length);
  if (!parseTree2(updated, [], { allowTrailingComma: true, allowEmptyContent: true })) updated += "\n{}\n";
  const options = { formattingOptions: { insertSpaces: true, tabSize: 2, eol: updated.includes("\r\n") ? "\r\n" : "\n" } };
  const reconcile = (at, before, after) => {
    if (JSON.stringify(before) === JSON.stringify(after)) return;
    if (object(before) && object(after)) {
      for (const key of Object.keys(before)) if (!Object.hasOwn(after, key)) updated = applyEdits(updated, modify(updated, [...at, key], void 0, options));
      for (const [key, value] of Object.entries(after)) reconcile([...at, key], before[key], value);
    } else updated = applyEdits(updated, modify(updated, at, after, options));
  };
  reconcile([], saved, desired);
  const result = bom + updated;
  if (original !== void 0 && result !== original) {
    await (0, import_promises.writeFile)(import_node_path.default.join(data, "config/settings.before-ned-0.3.3.jsonc"), original, { flag: "wx", mode: 384 }).catch((error) => {
      if (error.code !== "EEXIST") throw error;
    });
  }
  return result;
}
async function ensureEditorKeymap(file) {
  if (await readOwned(file) !== void 0) return;
  await (0, import_promises.writeFile)(file, JSON.stringify([{ context: "Workspace", bindings: { "ctrl-shift-a": ["agent::NewExternalAgentThread", { agent: "Ned" }] } }], null, 2) + "\n", { flag: "wx", mode: 384 }).catch((error) => {
    if (error.code !== "EEXIST") throw error;
  });
}
async function writeEditorPreferences(file, text) {
  const temp = file + "." + (0, import_node_crypto.randomUUID)() + ".tmp";
  try {
    await (0, import_promises.writeFile)(temp, text, { flag: "wx", mode: 384 });
    await (0, import_promises.rename)(temp, file);
  } finally {
    await (0, import_promises.unlink)(temp).catch(() => {
    });
  }
}

// distribution/ned/terminal.ts
function terminalShell(kind, systemRoot = process.env.SystemRoot ?? "C:\\Windows") {
  return { program: import_node_path2.default.win32.join(systemRoot, kind === "cmd" ? "System32/cmd.exe" : "System32/WindowsPowerShell/v1.0/powershell.exe"), args: kind === "cmd" ? ["/D"] : ["-NoLogo", "-NoProfile"] };
}
function supportedTerminal(value) {
  return value && typeof value.program === "string" && Object.keys(value).every((key) => ["program", "args"].includes(key)) && ["powershell", "cmd"].some((kind) => {
    const expected = terminalShell(kind);
    return import_node_path2.default.win32.normalize(value.program).toLowerCase() === expected.program.toLowerCase() && JSON.stringify(value.args) === JSON.stringify(expected.args);
  });
}
async function setDefaultTerminal(data, kind) {
  const file = import_node_path2.default.join(data, "config/settings.json"), info = await (0, import_promises2.lstat)(file);
  if (!info.isFile() || info.isSymbolicLink() || info.size > 2 * 1024 * 1024) throw Error("\uD3B8\uC9D1\uAE30 \uD130\uBBF8\uB110 \uC124\uC815 \uACBD\uB85C \uC624\uB958");
  const text = await (0, import_promises2.readFile)(file, "utf8"), errors = [];
  parse2(text.replace(/^\ufeff/, ""), errors, { allowTrailingComma: true });
  if (errors.length) throw Error("\uD3B8\uC9D1\uAE30 \uC124\uC815 JSONC\uB97C \uD655\uC778\uD558\uC138\uC694.");
  await writeEditorPreferences(file, applyEdits(text, modify(text, ["terminal", "shell"], terminalShell(kind), { formattingOptions: { insertSpaces: true, tabSize: 2 } })));
}
async function ensureTerminalTasks(data, platform = process.platform) {
  if (platform !== "win32") return;
  const file = import_node_path2.default.join(data, "config/tasks.json");
  const info = await (0, import_promises2.lstat)(file).catch((e) => {
    if (e.code === "ENOENT") return void 0;
    throw e;
  });
  if (info && (!info.isFile() || info.isSymbolicLink() || info.size > 2 * 1024 * 1024)) throw Error("\uD130\uBBF8\uB110 \uC791\uC5C5 \uC124\uC815 \uACBD\uB85C \uC624\uB958");
  const text = info ? await (0, import_promises2.readFile)(file, "utf8") : "[]\n", errors = [];
  const tasks = parse2(text, errors, { allowTrailingComma: true });
  if (errors.length || !Array.isArray(tasks)) throw Error("\uD130\uBBF8\uB110 \uC791\uC5C5 JSONC\uB97C \uD655\uC778\uD558\uC138\uC694. \uAE30\uC874 \uD30C\uC77C\uC744 \uBCF4\uC874\uD588\uC2B5\uB2C8\uB2E4.");
  let result = text, index = tasks.length;
  for (const kind of ["powershell", "cmd"]) {
    const label = kind === "cmd" ? "Ned: CMD" : "Ned: PowerShell";
    if (tasks.some((t) => t?.label === label)) continue;
    const shell = terminalShell(kind);
    result = applyEdits(result, modify(result, [index++], { label, command: shell.program, args: [...shell.args, kind === "cmd" ? "/K" : "-NoExit"], cwd: "$ZED_WORKTREE_ROOT", use_new_terminal: true, allow_concurrent_runs: true, reveal: "always" }, { formattingOptions: { insertSpaces: true, tabSize: 2 } }));
  }
  if (result !== text) await writeEditorPreferences(file, result);
}

// distribution/ned/agent-launch.ts
var import_node_path3 = __toESM(require("node:path"), 1);
function agentLaunch(executable2, agent, descriptor, platform = process.platform) {
  const env = { ELECTRON_RUN_AS_NODE: "1" };
  if (platform !== "win32") return { command: executable2, args: [agent, descriptor], env };
  const paths = import_node_path3.default.win32;
  if (![executable2, agent, descriptor].every((value) => paths.isAbsolute(value))) throw new Error("Managed agent paths must be absolute");
  const resources = paths.dirname(paths.dirname(agent));
  return {
    command: paths.join(resources, "runtime/windows-x64/openviking/python/python.exe"),
    args: ["-I", "-B", paths.join(resources, "runtime/windows-x64/openviking/sidecar-supervisor.py"), executable2, agent, descriptor],
    env
  };
}

// distribution/ned/editor-instructions.ts
var import_node_fs = require("node:fs");
var import_promises3 = require("node:fs/promises");
var import_node_path4 = __toESM(require("node:path"), 1);
var koreanInstructions = `## Speak Korean

You must speak or write only in Korean.

You may use English words for technical terms or proper nouns that are difficult to replace.

Never use other languages, such as Chinese or Japanese.`;
async function ensureEditorInstructions(directory3) {
  const file = import_node_path4.default.join(directory3, "AGENTS.md");
  const existing = await (0, import_promises3.lstat)(file).catch((error) => {
    if (error.code === "ENOENT") return void 0;
    throw error;
  });
  if (existing && (!existing.isFile() || existing.isSymbolicLink() || existing.size > 1024 * 1024)) throw new Error("Ned AGENTS.md \uD30C\uC77C \uD615\uC2DD \uB610\uB294 \uACBD\uB85C\uB97C \uD655\uC778\uD558\uC138\uC694.");
  const before = existing ? await (0, import_promises3.readFile)(file, "utf8") : "";
  if (before.replace(/\r\n/g, "\n").includes(koreanInstructions)) return;
  const separator = !before || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
  const handle = await (0, import_promises3.open)(file, import_node_fs.constants.O_CREAT | import_node_fs.constants.O_WRONLY | import_node_fs.constants.O_APPEND | (import_node_fs.constants.O_NOFOLLOW ?? 0), 384);
  try {
    await handle.writeFile(separator + koreanInstructions + "\n", "utf8");
  } finally {
    await handle.close();
  }
}

// distribution/ned/profile.ts
function editorSettings(executable2, agent, descriptor, proxy, clangd, platform = process.platform, native) {
  return {
    telemetry: { diagnostics: false, metrics: false },
    auto_update: false,
    restore_on_startup: "launchpad",
    ...platform === "win32" ? { terminal: { shell: terminalShell("powershell"), working_directory: "current_project_directory" } } : {},
    // Avoid the native picker callback crash in the managed Windows editor.
    // Ned's tray picker uses the host's real Windows shell profile instead.
    ...platform === "win32" ? { use_system_path_prompts: false } : {},
    proxy,
    server_url: proxy,
    credentials_url: "http://127.0.0.1:1/ned-private-credentials",
    auto_install_extensions: { html: false },
    suggest_extensions: false,
    granted_extension_capabilities: [],
    language_servers: [],
    format_on_save: "off",
    features: { edit_prediction_provider: "none" },
    show_edit_predictions: false,
    enable_language_server: false,
    enable_semantic_tokens: false,
    languages: {
      C: { language_servers: clangd ? ["clangd"] : [], enable_language_server: !!clangd },
      "C++": { language_servers: clangd ? ["clangd"] : [], enable_language_server: !!clangd }
    },
    lsp: clangd ? { clangd: { binary: { path: clangd, arguments: ["--background-index", "--clang-tidy=false"], ignore_system_version: false } } } : {},
    collaboration_panel: { button: false },
    notification_panel: { button: false },
    title_bar: { show_onboarding_banner: false, show_sign_in: false },
    agent: { default_profile: native ? "write" : "ask", enable_feedback: false, ...native ? { default_model: { provider: "Intranet", model: native.defaultModel }, profiles: Object.fromEntries(["write", "ask", "minimal"].map((id) => [id, { name: { write: "Write", ask: "Ask", minimal: "Minimal" }[id], enable_all_context_servers: false, context_servers: {}, tools: { fetch: false, search_web: false } }])) } : {} },
    ...native ? { language_models: { openai_compatible: { Intranet: { api_url: proxy.replace(/\/$/, "") + "/v1", available_models: native.models } } } } : {},
    agent_servers: { Ned: { type: "custom", ...agentLaunch(executable2, agent, descriptor) } },
    context_servers: {},
    session: { trust_all_worktrees: false, restore_unsaved_buffers: true },
    prettier: { allowed: false },
    // No per-user shell startup or shell environment extraction for the agent.
    load_direnv: "disabled"
  };
}
async function prepareEditor(root, executable2, resources, descriptor, proxy, native) {
  const data = import_node_path5.default.join(root, "editor"), home = import_node_path5.default.join(data, "home");
  await (0, import_promises4.mkdir)(import_node_path5.default.join(data, "config"), { recursive: true, mode: 448 });
  await ensureEditorInstructions(import_node_path5.default.join(data, "config"));
  for (const directory3 of ["home", "home/AppData/Local", "home/AppData/Roaming", "home/AppData/LocalLow", "home/Desktop", "home/Documents", "home/Downloads", "roaming", "local", "config-home", "data", "cache", "state", "tmp"]) await (0, import_promises4.mkdir)(import_node_path5.default.join(data, directory3), { recursive: true, mode: 448 });
  const clangd = process.platform === "win32" ? import_node_path5.default.join(resources, "runtime/windows-x64/mcp/clangd/clangd_23.1.0/bin/clangd.exe") : void 0;
  const settings2 = await editorPreferences(data, editorSettings(executable2, import_node_path5.default.join(resources, "ned/agent.cjs"), descriptor, proxy, clangd, process.platform, native));
  validateManagedZedSettings(settings2);
  await writeEditorPreferences(import_node_path5.default.join(data, "config/settings.json"), settings2);
  await ensureEditorKeymap(import_node_path5.default.join(data, "config/keymap.json"));
  const env = {};
  for (const key of ["SystemRoot", "SYSTEMROOT", "WINDIR", "SystemDrive", "ProgramFiles", "ProgramFiles(x86)", "ProgramW6432", "ProgramData", "PATHEXT", "LANG", "LC_ALL", "DISPLAY", "WAYLAND_DISPLAY", "XAUTHORITY", "DBUS_SESSION_BUS_ADDRESS", "XDG_RUNTIME_DIR"])
    if (process.env[key]) env[key] = process.env[key];
  return { data, env: {
    ...env,
    HOME: home,
    USERPROFILE: home,
    APPDATA: import_node_path5.default.join(home, "AppData", "Roaming"),
    LOCALAPPDATA: import_node_path5.default.join(home, "AppData", "Local"),
    XDG_CONFIG_HOME: import_node_path5.default.join(data, "config-home"),
    XDG_DATA_HOME: import_node_path5.default.join(data, "data"),
    XDG_CACHE_HOME: import_node_path5.default.join(data, "cache"),
    XDG_STATE_HOME: import_node_path5.default.join(data, "state"),
    PATH: process.platform === "win32" ? ["System32", "", "System32/Wbem", "System32/WindowsPowerShell/v1.0"].map((p) => import_node_path5.default.join(process.env.SystemRoot ?? "C:\\Windows", p)).join(import_node_path5.default.delimiter) : "/usr/bin:/bin",
    ...process.platform === "win32" ? { ComSpec: import_node_path5.default.join(process.env.SystemRoot ?? "C:\\Windows", "System32/cmd.exe") } : {},
    TEMP: import_node_path5.default.join(data, "tmp"),
    TMP: import_node_path5.default.join(data, "tmp"),
    HTTP_PROXY: proxy,
    HTTPS_PROXY: proxy,
    ALL_PROXY: proxy,
    http_proxy: proxy,
    https_proxy: proxy,
    all_proxy: proxy,
    NO_PROXY: "",
    no_proxy: "",
    DO_NOT_TRACK: "1",
    OTEL_SDK_DISABLED: "true",
    ...native ? { INTRANET_API_KEY: native.token } : {}
  } };
}

// tests/zed-settings.test.ts
(0, import_node_test.test)("rebuild1 missing profile names are repaired without resetting UI; incomplete native capabilities are rejected", async (t) => {
  const root = await (0, import_promises5.mkdtemp)(import_node_path6.default.join((0, import_node_os.tmpdir)(), "ned-zed-settings-"));
  t.after(() => (0, import_promises5.rm)(root, { recursive: true, force: true }));
  await (0, import_promises5.mkdir)(import_node_path6.default.join(root, "editor/config"), { recursive: true });
  await (0, import_promises5.writeFile)(import_node_path6.default.join(root, "editor/config/settings.json"), JSON.stringify({ buffer_font_size: 23, agent: { dock: "left", profiles: { write: { tools: { fetch: false } } } } }));
  const native = { baseUrl: "http://127.0.0.1:12345/v1", token: "ephemeral", defaultModel: "m", models: [{ name: "m", display_name: "test", max_tokens: 32e3, max_output_tokens: 4096, capabilities: { tools: true, images: false, parallel_tool_calls: false, prompt_cache_key: false, interleaved_reasoning: false, chat_completions: true, max_tokens_parameter: true } }] };
  await prepareEditor(root, "/Ned.exe", "/resources", "/descriptor", "http://127.0.0.1:9", native);
  const text = await (0, import_promises5.readFile)(import_node_path6.default.join(root, "editor/config/settings.json"), "utf8"), value = JSON.parse(text);
  validateManagedZedSettings(text);
  import_strict.default.equal(value.buffer_font_size, 23);
  import_strict.default.equal(value.agent.dock, "left");
  import_strict.default.equal(value.agent.profiles.write.name, "Write");
  import_strict.default.equal(value.agent.profiles.ask.name, "Ask");
  import_strict.default.equal(value.agent.profiles.minimal.name, "Minimal");
  delete value.agent.profiles.write.name;
  import_strict.default.throws(() => validateManagedZedSettings(JSON.stringify(value)), /agent.profiles.write.name/);
  value.agent.profiles.write.name = "Write";
  delete value.language_models.openai_compatible.Intranet.available_models[0].capabilities.prompt_cache_key;
  import_strict.default.throws(() => validateManagedZedSettings(JSON.stringify(value)), /prompt_cache_key/);
});

// tests/zed-history.test.ts
var import_node_test2 = require("node:test");
var import_strict2 = __toESM(require("node:assert/strict"), 1);
var import_node_sqlite2 = require("node:sqlite");
var import_promises7 = require("node:fs/promises");
var import_node_os2 = require("node:os");
var import_node_path8 = __toESM(require("node:path"), 1);
var import_node_zlib2 = require("node:zlib");

// distribution/ned/zed-history.ts
var import_node_sqlite = require("node:sqlite");
var import_node_zlib = require("node:zlib");
var import_node_crypto2 = require("node:crypto");
var import_promises6 = require("node:fs/promises");
var import_node_path7 = __toESM(require("node:path"), 1);
var columns = ["id", "summary", "updated_at", "data_type", "data", "parent_id", "folder_paths", "folder_paths_order", "created_at"];
var schema = `CREATE TABLE IF NOT EXISTS threads (id TEXT PRIMARY KEY, summary TEXT NOT NULL, updated_at TEXT NOT NULL, data_type TEXT NOT NULL, data BLOB NOT NULL, parent_id TEXT, folder_paths TEXT, folder_paths_order TEXT, created_at TEXT)`;
async function safeFile(file, optional = false) {
  const info = await (0, import_promises6.lstat)(file).catch((e) => {
    if (optional && e.code === "ENOENT") return void 0;
    throw e;
  });
  if (info && (!info.isFile() || info.isSymbolicLink() || info.size > 1024 * 1024 * 1024)) throw Error("\uB300\uD654 DB\uB294 1 GiB \uC774\uD558\uC758 \uB85C\uCEEC \uC77C\uBC18 \uD30C\uC77C\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.");
  return info;
}
var active = /* @__PURE__ */ new Set();
async function importZedHistory(source, editorData) {
  const key = process.platform === "win32" ? import_node_path7.default.resolve(editorData).toLowerCase() : import_node_path7.default.resolve(editorData);
  if (active.has(key)) throw Error("\uB300\uD654 \uAC00\uC838\uC624\uAE30\uAC00 \uC9C4\uD589 \uC911\uC785\uB2C8\uB2E4. \uC644\uB8CC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.");
  active.add(key);
  try {
    return await importHistorySnapshot(source, editorData);
  } finally {
    active.delete(key);
  }
}
async function importHistorySnapshot(source, editorData) {
  if (!import_node_path7.default.isAbsolute(source) || /^\\\\|^\/\//.test(source) || import_node_path7.default.extname(source).toLowerCase() !== ".db") throw Error("\uB85C\uCEEC Zed threads.db \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694.");
  const sourceInfo = await safeFile(source);
  const folder = import_node_path7.default.join(editorData, "threads"), target = import_node_path7.default.join(folder, "threads.db");
  if (import_node_path7.default.resolve(source) === import_node_path7.default.resolve(target)) throw Error("Ned \uC790\uC2E0\uC758 \uB300\uD654 DB\uB294 \uAC00\uC838\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  const backupRoot = import_node_path7.default.join(editorData, "history-backups");
  for (const dir of [editorData, folder, backupRoot]) {
    const s = await (0, import_promises6.lstat)(dir).catch((e) => {
      if (e.code === "ENOENT") return void 0;
      throw e;
    });
    if (s && (!s.isDirectory() || s.isSymbolicLink())) throw Error("Ned \uB300\uD654 \uC800\uC7A5 \uACBD\uB85C \uC624\uB958");
    if (!s) await (0, import_promises6.mkdir)(dir, { mode: 448 });
  }
  const existing = await safeFile(target, true);
  if (existing && existing.dev === sourceInfo.dev && existing.ino === sourceInfo.ino) throw Error("Ned \uC790\uC2E0\uC758 \uB300\uD654 DB\uB294 \uAC00\uC838\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  const store = import_node_path7.default.join(backupRoot, (0, import_node_crypto2.randomUUID)());
  await (0, import_promises6.mkdir)(store, { mode: 448 });
  let input, snapshot, output;
  let committed = false;
  const result = { imported: 0, duplicates: 0, conflicts: 0, unsupported: 0, backup: existing ? import_node_path7.default.join(store, "ned-before.db") : void 0 };
  try {
    input = new import_node_sqlite.DatabaseSync(source, { readOnly: true });
    await (0, import_node_sqlite.backup)(input, import_node_path7.default.join(store, "zed-source.db"));
    input.close();
    input = void 0;
    snapshot = new import_node_sqlite.DatabaseSync(import_node_path7.default.join(store, "zed-source.db"), { readOnly: true });
    const names = new Set(snapshot.prepare("PRAGMA table_info(threads)").all().map((r) => String(r.name)));
    if (!columns.slice(0, 5).every((c) => names.has(c))) throw Error("\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 Zed \uB300\uD654 DB \uD615\uC2DD\uC785\uB2C8\uB2E4. \uC6D0\uBCF8\uC740 \uBCC0\uACBD\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.");
    const count = Number(snapshot.prepare("SELECT count(*) AS n FROM threads").get().n);
    if (count > 2e4) throw Error("\uB300\uD654\uAC00 20,000\uAC1C\uB97C \uCD08\uACFC\uD569\uB2C8\uB2E4. \uB098\uB204\uC5B4 \uAC00\uC838\uC62C \uC218 \uC788\uB294\uC9C0 \uD655\uC778\uD558\uC138\uC694.");
    output = new import_node_sqlite.DatabaseSync(target);
    output.exec("PRAGMA busy_timeout=3000");
    if (existing) await (0, import_node_sqlite.backup)(output, result.backup);
    output.exec("BEGIN IMMEDIATE");
    try {
      output.exec(schema);
      const dest = new Set(output.prepare("PRAGMA table_info(threads)").all().map((r) => String(r.name)));
      if (!columns.slice(0, 5).every((c) => dest.has(c))) throw Error("Ned \uB300\uD654 DB \uD615\uC2DD\uC744 \uD655\uC778\uD558\uC138\uC694. \uC6D0\uBCF8\uACFC \uBC31\uC5C5\uC744 \uBCF4\uC874\uD588\uC2B5\uB2C8\uB2E4.");
      for (const name of columns.slice(5)) if (!dest.has(name)) {
        output.exec(`ALTER TABLE threads ADD COLUMN ${name} TEXT`);
        dest.add(name);
      }
      const fields2 = columns.filter((c) => dest.has(c));
      const insert = output.prepare(`INSERT INTO threads (${fields2.join(",")}) VALUES (${fields2.map(() => "?").join(",")})`);
      const exists2 = output.prepare("SELECT summary, updated_at, data_type, data FROM threads WHERE id=?");
      const rows = snapshot.prepare("SELECT " + columns.map((c) => names.has(c) ? c : `NULL AS ${c}`).join(",") + " FROM threads");
      for (const row of rows.iterate()) {
        try {
          if (typeof row.id !== "string" || row.id.length > 256 || typeof row.summary !== "string" || typeof row.updated_at !== "string" || !(row.data instanceof Uint8Array) || row.data.length > 16 * 1024 * 1024 || !["json", "zstd"].includes(String(row.data_type))) throw Error();
          const plain = row.data_type === "zstd" ? (0, import_node_zlib.zstdDecompressSync)(row.data, { maxOutputLength: 32 * 1024 * 1024 }) : Buffer.from(row.data);
          const thread = JSON.parse(plain.toString());
          if (thread.version !== "0.3.0" || !Array.isArray(thread.messages)) throw Error();
          thread.sandbox_grants = {};
          thread.model = null;
          const encoded = Buffer.from(JSON.stringify(thread));
          row.data = row.data_type === "zstd" ? (0, import_node_zlib.zstdCompressSync)(encoded) : encoded;
          const prior = exists2.get(row.id);
          if (prior) {
            if (prior.summary === row.summary && prior.updated_at === row.updated_at && prior.data_type === row.data_type && Buffer.from(prior.data).equals(row.data)) result.duplicates++;
            else result.conflicts++;
            continue;
          }
        } catch {
          result.unsupported++;
          continue;
        }
        insert.run(...fields2.map((c) => row[c]));
        result.imported++;
      }
      output.exec("COMMIT");
      committed = true;
    } catch (e) {
      output.exec("ROLLBACK");
      throw e;
    }
    return result;
  } finally {
    input?.close();
    snapshot?.close();
    output?.close();
    if (!existing && !committed) await (0, import_promises6.rm)(target, { force: true });
  }
}

// tests/zed-history.test.ts
(0, import_node_test2.test)("Zed history merges committed WAL rows, preserves source, removes prior grants, deduplicates and never overwrites conflicts", async (t) => {
  const root = await (0, import_promises7.mkdtemp)(import_node_path8.default.join((0, import_node_os2.tmpdir)(), "ned-zed-import-"));
  const handles = [];
  t.after(async () => {
    for (const db2 of handles.reverse()) db2.close();
    await (0, import_promises7.rm)(root, { recursive: true, force: true });
  });
  const editor = import_node_path8.default.join(root, "editor");
  await (0, import_promises7.mkdir)(editor);
  const source = import_node_path8.default.join(root, "threads.db"), db = new import_node_sqlite2.DatabaseSync(source);
  handles.push(db);
  db.exec("PRAGMA journal_mode=WAL; CREATE TABLE threads(id TEXT PRIMARY KEY,summary TEXT,updated_at TEXT,data_type TEXT,data BLOB)");
  const bytes = (0, import_node_zlib2.zstdCompressSync)(Buffer.from(JSON.stringify({ version: "0.3.0", title: "original", messages: [], model: { provider: "private" }, sandbox_grants: { allow_fs_write_all: true } })));
  db.prepare("INSERT INTO threads VALUES(?,?,?,?,?)").run("t1", "original", "2026-01-01", "zstd", bytes);
  const report = await importZedHistory(source, editor);
  import_strict2.default.equal(report.imported, 1);
  import_strict2.default.equal(report.unsupported, 0);
  const out = new import_node_sqlite2.DatabaseSync(import_node_path8.default.join(editor, "threads/threads.db"));
  handles.push(out);
  const thread = JSON.parse((0, import_node_zlib2.zstdDecompressSync)(out.prepare("SELECT data FROM threads").get().data).toString());
  import_strict2.default.deepEqual(thread.sandbox_grants, {});
  import_strict2.default.equal(thread.model, null);
  import_strict2.default.deepEqual(Buffer.from(db.prepare("SELECT data FROM threads").get().data), bytes);
  const second = await importZedHistory(source, editor);
  import_strict2.default.equal(second.duplicates, 1);
  import_strict2.default.ok((await (0, import_promises7.readFile)(second.backup)).length > 0);
  out.prepare("UPDATE threads SET summary=?").run("NED USER EDIT");
  const third = await importZedHistory(source, editor);
  import_strict2.default.equal(third.conflicts, 1);
  import_strict2.default.equal(out.prepare("SELECT summary FROM threads").get().summary, "NED USER EDIT");
});
(0, import_node_test2.test)("older target tables gain known metadata columns and unsupported rows leave the original unchanged", async (t) => {
  const root = await (0, import_promises7.mkdtemp)(import_node_path8.default.join((0, import_node_os2.tmpdir)(), "ned-zed-schema-"));
  const handles = [];
  t.after(async () => {
    for (const db of handles.reverse()) db.close();
    await (0, import_promises7.rm)(root, { recursive: true, force: true });
  });
  const editor = import_node_path8.default.join(root, "editor");
  await (0, import_promises7.mkdir)(import_node_path8.default.join(editor, "threads"), { recursive: true });
  const source = import_node_path8.default.join(root, "threads.db"), input = new import_node_sqlite2.DatabaseSync(source);
  const target = new import_node_sqlite2.DatabaseSync(import_node_path8.default.join(editor, "threads/threads.db"));
  handles.push(input, target);
  const basic = "CREATE TABLE threads(id TEXT PRIMARY KEY,summary TEXT,updated_at TEXT,data_type TEXT,data BLOB";
  input.exec(basic + ",parent_id TEXT,folder_paths TEXT,folder_paths_order TEXT,created_at TEXT)");
  target.exec(basic + ")");
  const data = Buffer.from(JSON.stringify({ version: "0.3.0", messages: [], model: null, sandbox_grants: {} }));
  const put = input.prepare("INSERT INTO threads VALUES(?,?,?,?,?,?,?,?,?)");
  put.run("parent", "Original", "2026-01-01", "json", data, null, '["C:\\\\project"]', "[0]", "2025-01-01");
  put.run("child", "Child", "2026-01-01", "json", data, "parent", null, null, null);
  put.run("new-version", "Unsupported", "2026-01-01", "json", Buffer.from('{"version":"future","messages":[]}'), null, null, null, null);
  const result = await importZedHistory(source, editor);
  import_strict2.default.equal(result.imported, 2);
  import_strict2.default.equal(result.unsupported, 1);
  import_strict2.default.equal(target.prepare("SELECT parent_id FROM threads WHERE id=?").get("child").parent_id, "parent");
  import_strict2.default.equal(target.prepare("SELECT created_at FROM threads WHERE id=?").get("parent").created_at, "2025-01-01");
  import_strict2.default.equal(input.prepare("SELECT count(*) AS n FROM threads").get().n, 3);
});
(0, import_node_test2.test)("a hard-linked source and linked backup directory cannot redirect writes into original data", async (t) => {
  const { link, symlink: symlink2 } = await import("node:fs/promises");
  const root = await (0, import_promises7.mkdtemp)(import_node_path8.default.join((0, import_node_os2.tmpdir)(), "ned-zed-links-"));
  t.after(() => (0, import_promises7.rm)(root, { recursive: true, force: true }));
  const editor = import_node_path8.default.join(root, "editor");
  await (0, import_promises7.mkdir)(import_node_path8.default.join(editor, "threads"), { recursive: true });
  const source = import_node_path8.default.join(root, "threads.db"), db = new import_node_sqlite2.DatabaseSync(source);
  db.exec("CREATE TABLE threads(id TEXT,summary TEXT,updated_at TEXT,data_type TEXT,data BLOB)");
  db.close();
  const original = await (0, import_promises7.readFile)(source);
  const target = import_node_path8.default.join(editor, "threads/threads.db");
  await link(source, target);
  await import_strict2.default.rejects(importZedHistory(source, editor), /자신/);
  import_strict2.default.deepEqual(await (0, import_promises7.readFile)(source), original);
  await (0, import_promises7.rm)(target);
  await (0, import_promises7.rm)(import_node_path8.default.join(editor, "history-backups"), { recursive: true });
  const external = import_node_path8.default.join(root, "external");
  await (0, import_promises7.mkdir)(external);
  await symlink2(external, import_node_path8.default.join(editor, "history-backups"), "dir");
  await import_strict2.default.rejects(importZedHistory(source, editor), /저장 경로/);
  import_strict2.default.deepEqual(await (0, import_promises7.readFile)(source), original);
});

// tests/skill-seed.test.ts
var import_node_test3 = require("node:test");
var import_strict3 = __toESM(require("node:assert/strict"), 1);
var import_promises13 = require("node:fs/promises");
var import_node_crypto7 = require("node:crypto");
var import_node_os3 = require("node:os");
var import_node_path13 = __toESM(require("node:path"), 1);

// src/main/skill-seed.ts
var import_node_crypto6 = require("node:crypto");
var import_promises12 = require("node:fs/promises");
var import_node_path12 = __toESM(require("node:path"), 1);
var import_yaml = __toESM(require_dist(), 1);
init_config();
init_openviking_skills();
init_openviking_namespace();
function sameSkillDocument(text, pkg) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match || match[2].trim() !== pkg.body.trim()) return false;
  const doc = (0, import_yaml.parseDocument)(match[1], { uniqueKeys: true });
  if (doc.errors.length || doc.warnings.length) return false;
  const meta = doc.toJS({ maxAliasCount: 0 });
  return meta && Object.keys(meta).length === 2 && meta.name === pkg.name && meta.description === pkg.description;
}
function preparedSkillFiles(pkg) {
  const files = new Map(pkg.files);
  files.set(".source.json", Buffer.from(JSON.stringify({ type: "ned-bundle", source: "offline-bundle", ned_owner: "bundled-skills", ned_bundle_sha256: pkg.hash, ned_id: pkg.id, upstream_source: pkg.source, upstream_commit: pkg.commit }, null, 2) + "\n"));
  files.set(".abstract.md", Buffer.from("name: " + pkg.name + "\ndescription: " + JSON.stringify(pkg.description) + "\n"));
  files.set(".overview.md", Buffer.from(pkg.body + "\n"));
  return files;
}
async function untrackedFiles(folder, expected, prefix = "") {
  for (const entry of await (0, import_promises12.readdir)(folder, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) return true;
    const rel = prefix ? prefix + "/" + entry.name : entry.name;
    if ([".source.json", ".abstract.md", ".overview.md", ".meta.json"].includes(entry.name)) continue;
    if (entry.isDirectory()) {
      if (await untrackedFiles(import_node_path12.default.join(folder, entry.name), expected, rel)) return true;
    } else if (!expected.has(rel)) return true;
  }
  return false;
}
var hash = (b) => (0, import_node_crypto6.createHash)("sha256").update(b).digest("hex");
async function regular(file) {
  const info = await (0, import_promises12.lstat)(file).catch((e) => {
    if (e.code === "ENOENT") return void 0;
    throw e;
  });
  if (info && (!info.isFile() || info.isSymbolicLink() || info.size > 8 * 1024 * 1024)) throw Error("\uAE30\uBCF8 \uC2A4\uD0AC \uC800\uC7A5 \uACBD\uB85C \uC624\uB958");
  return info ? (0, import_promises12.readFile)(file) : void 0;
}
async function directory2(folder) {
  const info = await (0, import_promises12.lstat)(folder).catch((e) => {
    if (e.code === "ENOENT") return void 0;
    throw e;
  });
  if (info && (!info.isDirectory() || info.isSymbolicLink())) throw Error("\uAE30\uBCF8 \uC2A4\uD0AC \uC800\uC7A5 \uACBD\uB85C \uC624\uB958");
  if (!info) await (0, import_promises12.mkdir)(folder, { mode: 448 });
}
async function hashes(folder, names) {
  const result = {};
  for (const name of names) {
    if (!name || import_node_path12.default.isAbsolute(name) || /[\\:\x00-\x1f]/.test(name) || name.split("/").some((part) => !part || part === "." || part === "..")) throw Error("\uAE30\uBCF8 \uC2A4\uD0AC \uAE30\uB85D \uACBD\uB85C \uC624\uB958");
    let parent = folder;
    for (const part of name.split("/").slice(0, -1)) {
      parent = import_node_path12.default.join(parent, part);
      const s = await (0, import_promises12.lstat)(parent);
      if (!s.isDirectory() || s.isSymbolicLink()) throw Error("\uAE30\uBCF8 \uC2A4\uD0AC \uC800\uC7A5 \uACBD\uB85C \uC624\uB958");
    }
    const bytes = await regular(import_node_path12.default.join(folder, name));
    if (!bytes) return void 0;
    result[name] = hash(bytes);
  }
  return result;
}
async function seedBundledSkills(bundle, workspace, stateFile, progress, signal) {
  const packages = await loadBundledSkillPackages(bundle);
  const preparedRoot = import_node_path12.default.join(import_node_path12.default.dirname(bundle), "skill-seed");
  const preparedManifest = await regular(import_node_path12.default.join(preparedRoot, "manifest.json"));
  if (preparedManifest) {
    const manifest = JSON.parse(preparedManifest.toString());
    if (manifest.schemaVersion !== 1 || manifest.openViking !== "0.5.5" || manifest.count !== packages.length || manifest.sourceManifestSha256 !== hash(await (0, import_promises12.readFile)(import_node_path12.default.join(bundle, "manifest.json")))) throw Error("\uC124\uCE58\uB41C \uAE30\uBCF8 \uC2A4\uD0AC \uC900\uBE44 \uBB36\uC74C\uC774 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
  }
  const recordFile = stateFile.replace(/\.json$/, "-seed.json");
  const bytes = await regular(recordFile);
  const saved = bytes ? JSON.parse(bytes.toString()) : { schemaVersion: 1, entries: {} };
  if (saved.schemaVersion !== 1 || !saved.entries || Array.isArray(saved.entries) || typeof saved.entries !== "object") throw Error("\uAE30\uBCF8 \uC2A4\uD0AC \uC900\uBE44 \uAE30\uB85D \uC624\uB958. \uAE30\uC874 \uAE30\uB85D\uC744 \uBCF4\uC874\uD588\uC2B5\uB2C8\uB2E4.");
  for (const value of Object.values(saved.entries)) if (!value || !/^[a-f0-9]{64}$/.test(value.bundleHash) || !value.files || Array.isArray(value.files) || typeof value.files !== "object" || Object.values(value.files).some((v) => typeof v !== "string" || !/^[a-f0-9]{64}$/.test(v))) throw Error("\uAE30\uBCF8 \uC2A4\uD0AC \uC900\uBE44 \uAE30\uB85D \uC624\uB958. \uAE30\uC874 \uAE30\uB85D\uC744 \uBCF4\uC874\uD588\uC2B5\uB2C8\uB2E4.");
  const previousBytes = await regular(stateFile);
  const previous = previousBytes ? JSON.parse(previousBytes.toString()) : void 0;
  const confirmed = new Set(packages.filter((p) => saved.entries[p.id]?.bundleHash === p.hash).map((p) => p.id));
  const state = { previousRegistered: Object.keys(previous?.entries ?? saved.entries).filter((id) => packages.some((p) => p.id === id)).length, status: "registering", registered: confirmed.size, total: packages.length, conflicts: [], failed: [], errors: [], checked: 0, reused: 0, installed: 0, updated: 0, indexStatus: "not-indexed" };
  if (state.previousRegistered) state.indexStatus = "unverified";
  let root = workspace;
  await (0, import_promises12.mkdir)(import_node_path12.default.dirname(root), { recursive: true, mode: 448 });
  await directory2(import_node_path12.default.dirname(root));
  for (const part of ["", "viking", "ned", "agent", "skills"]) {
    root = part ? import_node_path12.default.join(root, part) : root;
    await directory2(root);
  }
  for (const pkg of packages) {
    signal.throwIfAborted();
    state.current = { id: pkg.id, stage: "local-verify" };
    state.message = `\uC774\uC804 \uD655\uC778 ${state.previousRegistered}\uAC1C \xB7 \uC774\uBC88 \uB85C\uCEEC \uD655\uC778 ${state.checked}/${state.total}`;
    progress(structuredClone(state));
    const target = import_node_path12.default.join(root, pkg.name);
    let stage;
    try {
      const files = preparedSkillFiles(pkg);
      if (preparedManifest) {
        const actual2 = await hashes(preparedRoot, [...files.keys()].map((name) => pkg.name + "/" + name));
        if (!actual2 || [...files].some(([name, bytes2]) => actual2[pkg.name + "/" + name] !== hash(bytes2))) throw Error("\uAE30\uBCF8 \uC2A4\uD0AC \uC900\uBE44 \uD30C\uC77C \uBB34\uACB0\uC131 \uC624\uB958");
        for (const name of files.keys()) files.set(name, await regular(import_node_path12.default.join(preparedRoot, pkg.name, name)));
      }
      const journal = import_node_path12.default.join(root, ".ned-update-" + pkg.id + ".json");
      const pending = await regular(journal);
      const backups = import_node_path12.default.resolve(workspace, "..", "skill-backups");
      if (pending) {
        const record = JSON.parse(pending.toString());
        if (!/^\.ned-stage-[a-f0-9-]{36}$/.test(record.stage) || !/^[a-f0-9-]{36}$/.test(record.backup)) throw Error("\uAE30\uBCF8 \uC2A4\uD0AC \uBCF5\uAD6C \uAE30\uB85D \uC624\uB958");
        await directory2(backups);
        if (!await (0, import_promises12.lstat)(target).catch((e) => {
          if (e.code === "ENOENT") return void 0;
          throw e;
        })) await (0, import_promises12.rename)(import_node_path12.default.join(backups, record.backup), target);
        await (0, import_promises12.rm)(import_node_path12.default.join(root, record.stage), { recursive: true, force: true });
        await (0, import_promises12.rm)(journal);
      }
      const info = await (0, import_promises12.lstat)(target).catch((e) => {
        if (e.code === "ENOENT") return void 0;
        throw e;
      });
      if (info && (!info.isDirectory() || info.isSymbolicLink())) throw Error("\uAE30\uBCF8 \uC2A4\uD0AC \uC800\uC7A5 \uACBD\uB85C \uC624\uB958");
      const sourceBytes = info ? await regular(import_node_path12.default.join(target, ".source.json")) : void 0;
      const owner = sourceBytes ? JSON.parse(sourceBytes.toString()) : void 0;
      const owned = (owner?.ned_owner ?? owner?.[previousSkillOwner]) === "bundled-skills";
      if (owned) files.set(".source.json", Buffer.from(JSON.stringify({ ...owner, ...JSON.parse(files.get(".source.json").toString()) }, null, 2) + "\n"));
      const actual = info ? await hashes(target, [...pkg.files.keys()]) : void 0;
      const original = Object.fromEntries([...pkg.files].map(([name, b]) => [name, hash(b)]));
      const existingDocument = info ? (await regular(import_node_path12.default.join(target, "SKILL.md")))?.toString() : void 0;
      const same = actual && existingDocument && sameSkillDocument(existingDocument, pkg) && Object.keys(original).filter((name) => name !== "SKILL.md").every((name) => actual[name] === original[name]);
      if (info && !owned) {
        state.conflicts.push(pkg.id);
        continue;
      }
      if (info && same) {
        state.reused++;
      } else {
        if (info) {
          const prior = saved.entries[pkg.id] ?? (previous?.entries?.[pkg.id]?.verifiedFiles ? { files: previous.entries[pkg.id].verifiedFiles } : void 0);
          const before = prior?.files ? await hashes(target, Object.keys(prior.files)) : void 0;
          if (!prior?.files || !before || !Object.entries(prior.files).every(([name, value]) => before[name] === value)) {
            state.conflicts.push(pkg.id);
            continue;
          }
          const extras = await untrackedFiles(target, new Set(Object.keys(prior.files)));
          if (extras) {
            state.conflicts.push(pkg.id);
            continue;
          }
        }
        stage = import_node_path12.default.join(root, ".ned-stage-" + (0, import_node_crypto6.randomUUID)());
        await (0, import_promises12.mkdir)(stage, { mode: 448 });
        for (const [name, b] of files) {
          await (0, import_promises12.mkdir)(import_node_path12.default.dirname(import_node_path12.default.join(stage, name)), { recursive: true, mode: 448 });
          await (0, import_promises12.writeFile)(import_node_path12.default.join(stage, name), b, { flag: "wx", mode: 384 });
        }
        signal.throwIfAborted();
        if (info) {
          const backup2 = import_node_path12.default.join(backups, (0, import_node_crypto6.randomUUID)());
          await directory2(backups);
          await atomicJSON(journal, { stage: import_node_path12.default.basename(stage), backup: import_node_path12.default.basename(backup2) });
          await (0, import_promises12.rename)(target, backup2);
          try {
            await (0, import_promises12.rename)(stage, target);
          } catch (e) {
            await (0, import_promises12.rename)(backup2, target);
            throw e;
          }
          await (0, import_promises12.rm)(journal);
          state.updated++;
        } else {
          await (0, import_promises12.rename)(stage, target);
          state.installed++;
        }
        stage = void 0;
      }
      if (info && same) await atomicJSON(import_node_path12.default.join(target, ".source.json"), JSON.parse(files.get(".source.json").toString()));
      saved.entries[pkg.id] = { bundleHash: pkg.hash, files: same ? actual : original };
      await atomicJSON(recordFile, saved);
      if (!confirmed.has(pkg.id)) state.registered++;
    } catch {
      state.failed.push(pkg.id);
      state.errors.push({ id: pkg.id, stage: "local-verify", code: "OV_SKILL_LOCAL" });
    } finally {
      if ((state.failed.includes(pkg.id) || state.conflicts.includes(pkg.id)) && confirmed.has(pkg.id)) state.registered--;
      if (stage) await (0, import_promises12.rm)(stage, { recursive: true, force: true });
      state.checked++;
      progress(structuredClone(state));
    }
  }
  state.current = void 0;
  state.status = state.failed.length || state.conflicts.length ? "error" : "ready";
  state.message = `\uAE30\uBCF8 \uC2A4\uD0AC ${state.registered}/${state.total}\uAC1C \uB85C\uCEEC \uC900\uBE44 \xB7 \uC7AC\uC0AC\uC6A9 ${state.reused} \xB7 \uC2E0\uADDC ${state.installed} \xB7 \uAC31\uC2E0 ${state.updated}. \uAC80\uC0C9 \uC0C9\uC778 \uC0C1\uD0DC\uC640 \uBCC4\uAC1C\uC774\uBA70 \uB300\uD654\uB294 \uBC14\uB85C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.`;
  if (state.conflicts.length) state.message += "\n\uC6D0\uBCF8 \uBCF4\uC874 \uCDA9\uB3CC: " + state.conflicts.join(", ");
  if (state.failed.length) state.message += "\n\uD655\uC778 \uC2E4\uD328: " + state.failed.join(", ");
  progress(structuredClone(state));
  return state;
}

// tests/skill-seed.test.ts
var sha = (b) => (0, import_node_crypto7.createHash)("sha256").update(b).digest("hex");
async function fixture(t) {
  const root = await (0, import_promises13.mkdtemp)(import_node_path13.default.join((0, import_node_os3.tmpdir)(), "ned-seed-"));
  t.after(() => (0, import_promises13.rm)(root, { recursive: true, force: true }));
  const bundle = import_node_path13.default.join(root, "skills");
  await (0, import_promises13.mkdir)(bundle);
  await (0, import_promises13.cp)("vendor/skills/cpp-testing", import_node_path13.default.join(bundle, "cpp-testing"), { recursive: true });
  const manifest = JSON.parse(await (0, import_promises13.readFile)("vendor/skills/manifest.json", "utf8"));
  manifest.skills = manifest.skills.filter((s) => s.id === "cpp-testing");
  const save = async () => {
    const bytes = JSON.stringify(manifest);
    await (0, import_promises13.writeFile)(import_node_path13.default.join(bundle, "manifest.json"), bytes);
    await (0, import_promises13.writeFile)(import_node_path13.default.join(root, "skills-lock.json"), JSON.stringify({ schemaVersion: 1, count: 1, manifestSha256: sha(bytes) }));
  };
  await save();
  const workspace = import_node_path13.default.join(root, "openviking/data"), state = import_node_path13.default.join(root, "openviking/bundled-skills.json");
  const run = () => seedBundledSkills(bundle, workspace, state, () => {
  }, new AbortController().signal);
  return { root, bundle, manifest, workspace, state, run, save, installed: import_node_path13.default.join(workspace, "viking/ned/agent/skills/ned-cpp-testing") };
}
(0, import_node_test3.test)("prepared skills work without model/HTTP registration, restart reuses and changed files update with backup", async (t) => {
  const { bundle, manifest, run, save, installed: installed2 } = await fixture(t);
  let result = await run();
  import_strict3.default.equal(result.status, "ready");
  import_strict3.default.equal(result.installed, 1);
  import_strict3.default.equal(result.indexStatus, "not-indexed");
  import_strict3.default.match(await (0, import_promises13.readFile)(import_node_path13.default.join(installed2, ".abstract.md"), "utf8"), /ned-cpp-testing/);
  result = await run();
  import_strict3.default.equal(result.reused, 1);
  import_strict3.default.equal(result.installed, 0);
  const document = await (0, import_promises13.readFile)(import_node_path13.default.join(bundle, "cpp-testing/SKILL.md"), "utf8") + "\nUpdated default.\n";
  await (0, import_promises13.writeFile)(import_node_path13.default.join(bundle, "cpp-testing/SKILL.md"), document);
  manifest.skills[0].files.find((f) => f.path === "SKILL.md").sha256 = sha(document);
  await save();
  result = await run();
  import_strict3.default.equal(result.updated, 1);
  import_strict3.default.equal(result.status, "ready");
  await (0, import_promises13.writeFile)(import_node_path13.default.join(installed2, "SKILL.md"), "USER EDIT");
  result = await run();
  import_strict3.default.deepEqual(result.conflicts, ["cpp-testing"]);
  import_strict3.default.equal(await (0, import_promises13.readFile)(import_node_path13.default.join(installed2, "SKILL.md"), "utf8"), "USER EDIT");
});
(0, import_node_test3.test)("legacy SDK frontmatter and user additions are retained, interrupted replacement restores the recorded original", async (t) => {
  const f = await fixture(t);
  await f.run();
  const before = await (0, import_promises13.readFile)(import_node_path13.default.join(f.installed, "SKILL.md"), "utf8");
  await (0, import_promises13.writeFile)(import_node_path13.default.join(f.installed, "SKILL.md"), before.replace("name: ned-cpp-testing", "name: 'ned-cpp-testing'"));
  await (0, import_promises13.rm)(f.state.replace(/\.json$/, "-seed.json"));
  let result = await f.run();
  import_strict3.default.equal(result.reused, 1);
  await (0, import_promises13.writeFile)(import_node_path13.default.join(f.installed, "MY-NOTES.md"), "User notes");
  const update = await (0, import_promises13.readFile)(import_node_path13.default.join(f.bundle, "cpp-testing/SKILL.md"), "utf8") + "\nPackage update\n";
  await (0, import_promises13.writeFile)(import_node_path13.default.join(f.bundle, "cpp-testing/SKILL.md"), update);
  f.manifest.skills[0].files.find((x) => x.path === "SKILL.md").sha256 = sha(update);
  await f.save();
  result = await f.run();
  import_strict3.default.deepEqual(result.conflicts, ["cpp-testing"]);
  import_strict3.default.equal(await (0, import_promises13.readFile)(import_node_path13.default.join(f.installed, "MY-NOTES.md"), "utf8"), "User notes");
  const { rename: rename5 } = await import("node:fs/promises");
  const { randomUUID: randomUUID6 } = await import("node:crypto");
  const backup2 = randomUUID6(), stage = ".ned-stage-" + randomUUID6(), root = import_node_path13.default.dirname(f.installed), backups = import_node_path13.default.resolve(f.workspace, "..", "skill-backups");
  await (0, import_promises13.mkdir)(backups, { recursive: true });
  await rename5(f.installed, import_node_path13.default.join(backups, backup2));
  await (0, import_promises13.mkdir)(import_node_path13.default.join(root, stage));
  await (0, import_promises13.writeFile)(import_node_path13.default.join(root, stage, "partial"), "incomplete");
  await (0, import_promises13.writeFile)(import_node_path13.default.join(root, ".ned-update-cpp-testing.json"), JSON.stringify({ backup: backup2, stage }));
  result = await f.run();
  import_strict3.default.deepEqual(result.conflicts, ["cpp-testing"]);
  import_strict3.default.equal(await (0, import_promises13.readFile)(import_node_path13.default.join(f.installed, "MY-NOTES.md"), "utf8"), "User notes");
});
(0, import_node_test3.test)("packaged seed is used only when it matches the source bundle, and tampering preserves installed user data", async (t) => {
  const f = await fixture(t);
  const { loadBundledSkillPackages: loadBundledSkillPackages2 } = await Promise.resolve().then(() => (init_openviking_skills(), openviking_skills_exports));
  const packages = await loadBundledSkillPackages2(f.bundle);
  const seed = import_node_path13.default.join(f.root, "skill-seed");
  await (0, import_promises13.mkdir)(seed);
  for (const pkg of packages) for (const [name, bytes] of preparedSkillFiles(pkg)) {
    const file = import_node_path13.default.join(seed, pkg.name, name);
    await (0, import_promises13.mkdir)(import_node_path13.default.dirname(file), { recursive: true });
    await (0, import_promises13.writeFile)(file, bytes);
  }
  await (0, import_promises13.writeFile)(import_node_path13.default.join(seed, "manifest.json"), JSON.stringify({ schemaVersion: 1, openViking: "0.5.5", count: 1, sourceManifestSha256: sha(await (0, import_promises13.readFile)(import_node_path13.default.join(f.bundle, "manifest.json"))) }));
  import_strict3.default.equal((await f.run()).installed, 1);
  await (0, import_promises13.writeFile)(import_node_path13.default.join(seed, packages[0].name, "SKILL.md"), "DAMAGED");
  const original = await (0, import_promises13.readFile)(import_node_path13.default.join(f.installed, "SKILL.md"), "utf8");
  const result = await f.run();
  import_strict3.default.deepEqual(result.failed, ["cpp-testing"]);
  import_strict3.default.equal(await (0, import_promises13.readFile)(import_node_path13.default.join(f.installed, "SKILL.md"), "utf8"), original);
});
(0, import_node_test3.test)("user-edited YAML metadata is a protected conflict even when the document body is unchanged", async (t) => {
  const f = await fixture(t);
  await f.run();
  const file = import_node_path13.default.join(f.installed, "SKILL.md");
  const before = await (0, import_promises13.readFile)(file, "utf8");
  await (0, import_promises13.writeFile)(file, before.replace("name: ned-cpp-testing", "name: ned-cpp-testing\nmetadata:\n  user_note: keep"));
  await (0, import_promises13.rm)(f.state.replace(/\.json$/, "-seed.json"));
  const state = await f.run();
  import_strict3.default.deepEqual(state.conflicts, ["cpp-testing"]);
  import_strict3.default.match(await (0, import_promises13.readFile)(file, "utf8"), /user_note: keep/);
});
for (const edited of [false, true]) (0, import_node_test3.test)(`a migrated pristine legacy package is replaced from verified hashes; later edits remain protected (${edited})`, async (t) => {
  const { rename: rename5 } = await import("node:fs/promises");
  const f = await fixture(t);
  await f.run();
  const file = import_node_path13.default.join(f.installed, "SKILL.md");
  await (0, import_promises13.writeFile)(file, (await (0, import_promises13.readFile)(file, "utf8")).replace("name: ned-cpp-testing", "name: l-vibe-cpp-testing"));
  await rename5(import_node_path13.default.join(f.installed, "NED-BUNDLE.json"), import_node_path13.default.join(f.installed, "L-VIBE-BUNDLE.json"));
  const record = JSON.parse(await (0, import_promises13.readFile)(f.state.replace(/\.json$/, "-seed.json"), "utf8"));
  const names = Object.keys(record.entries["cpp-testing"].files).map((name) => name === "NED-BUNDLE.json" ? "L-VIBE-BUNDLE.json" : name);
  const verifiedFiles = Object.fromEntries(await Promise.all(names.map(async (name) => [name, sha(await (0, import_promises13.readFile)(import_node_path13.default.join(f.installed, name)))])));
  await (0, import_promises13.rm)(f.state.replace(/\.json$/, "-seed.json"));
  await (0, import_promises13.writeFile)(f.state, JSON.stringify({ schemaVersion: 1, entries: { "cpp-testing": { bundleHash: "previous-package-hash", revision: "verified-by-sdk-migration", verifiedFiles } } }));
  if (edited) await (0, import_promises13.writeFile)(file, await (0, import_promises13.readFile)(file, "utf8") + "\nUSER EDIT");
  const state = await f.run();
  if (edited) {
    import_strict3.default.deepEqual(state.conflicts, ["cpp-testing"]);
    import_strict3.default.match(await (0, import_promises13.readFile)(file, "utf8"), /USER EDIT/);
  } else {
    import_strict3.default.equal(state.updated, 1);
    import_strict3.default.equal(state.status, "ready");
    import_strict3.default.ok((await (0, import_promises13.readFile)(import_node_path13.default.join(f.installed, "NED-BUNDLE.json"))).length > 0);
  }
});

// tests/terminal.test.ts
var import_node_test4 = require("node:test");
var import_strict4 = __toESM(require("node:assert/strict"), 1);
var import_promises14 = require("node:fs/promises");
var import_node_os4 = require("node:os");
var import_node_path14 = __toESM(require("node:path"), 1);
(0, import_node_test4.test)("CMD selection survives an update; both independent terminals preserve JSONC and use the selected project", async (t) => {
  const root = await (0, import_promises14.mkdtemp)(import_node_path14.default.join((0, import_node_os4.tmpdir)(), "ned-terminal-"));
  t.after(() => (0, import_promises14.rm)(root, { recursive: true, force: true }));
  const editor = import_node_path14.default.join(root, "editor");
  await (0, import_promises14.mkdir)(import_node_path14.default.join(editor, "config"), { recursive: true });
  const file = import_node_path14.default.join(editor, "config/settings.json");
  await (0, import_promises14.writeFile)(file, '// USER_NOTE\n{"terminal":{"font_size":19}}');
  await setDefaultTerminal(editor, "cmd");
  await prepareEditor(root, "/Ned", "/resources", "/descriptor", "http://127.0.0.1:9");
  const value = parse2(await (0, import_promises14.readFile)(file, "utf8"));
  import_strict4.default.deepEqual(value.terminal.shell, terminalShell("cmd"));
  import_strict4.default.equal(value.terminal.font_size, 19);
  import_strict4.default.match(await (0, import_promises14.readFile)(file, "utf8"), /USER_NOTE/);
  import_strict4.default.ok(supportedTerminal({ args: ["/D"], program: terminalShell("cmd").program }));
  import_strict4.default.ok(!supportedTerminal({ program: "cmd.exe", args: ["/C", "untrusted"] }));
  const tasksFile = import_node_path14.default.join(editor, "config/tasks.json");
  await (0, import_promises14.writeFile)(tasksFile, '// MY_TASK\n[{"label":"custom","command":"my-build"},]');
  await ensureTerminalTasks(editor, "win32");
  await ensureTerminalTasks(editor, "win32");
  const tasks = parse2(await (0, import_promises14.readFile)(tasksFile, "utf8"));
  import_strict4.default.equal(tasks.length, 3);
  import_strict4.default.equal(tasks[0].command, "my-build");
  for (const task of tasks.slice(1)) {
    import_strict4.default.equal(task.cwd, "$ZED_WORKTREE_ROOT");
    import_strict4.default.equal(task.use_new_terminal, true);
  }
  import_strict4.default.match(await (0, import_promises14.readFile)(tasksFile, "utf8"), /MY_TASK/);
});

// tests/editor-preferences.test.ts
var import_node_test5 = require("node:test");
var import_strict5 = __toESM(require("node:assert/strict"), 1);
var import_promises15 = require("node:fs/promises");
var import_node_os5 = require("node:os");
var import_node_path15 = __toESM(require("node:path"), 1);
async function fixture2(t) {
  const root = await (0, import_promises15.mkdtemp)(import_node_path15.default.join((0, import_node_os5.tmpdir)(), "ned-preferences-"));
  t.after(() => (0, import_promises15.rm)(root, { recursive: true, force: true }));
  await (0, import_promises15.mkdir)(import_node_path15.default.join(root, "editor/config"), { recursive: true });
  return root;
}
var launch = (root, version = "one") => prepareEditor(root, "/Ned-" + version, "/resources-" + version, "/descriptor-" + version, "http://127.0.0.1:9");
(0, import_node_test5.test)("updates keep live JSONC fonts, panel layout, startup choice, keymap and workspace DB while refreshing managed endpoints", async (t) => {
  const root = await fixture2(t), file = import_node_path15.default.join(root, "editor/config/settings.json");
  const original = `// MY_LAYOUT
{
 "ui_font_size": 22, // MY_FONT
 "agent_ui_font_size":24,"agent_buffer_font_size":20,"agent_ui_font_family":"Malgun Gothic", "buffer_font_size": 19, "buffer_font_family":"Consolas",
 "terminal":{"font_size":18,"shell":{"program":"untrusted"}}, "agent":{"terminal_init_command":"untrusted","tool_permissions":{"default":"allow"},"dock":"left","default_width":520,"threads_sidebar":{"position":"right","default_width":280}},
 "project_panel":{"dock":"right","default_width":310}, "restore_on_startup":"last_session",
 "languages":{"C++":{"tab_size":8,"language_servers":["untrusted"]}},
 "agent_servers":{"Other":{"command":"untrusted"}},"telemetry":{"metrics":true},
}
`;
  await (0, import_promises15.writeFile)(file, original);
  await (0, import_promises15.writeFile)(import_node_path15.default.join(root, "editor/appearance.json"), '{"ui_font_size":10,"theme":"stale"}');
  const keymap = '// MY_KEYS\n[{"context":"Workspace","bindings":{"ctrl-shift-a":"custom::Action"}},]\n';
  await (0, import_promises15.writeFile)(import_node_path15.default.join(root, "editor/config/keymap.json"), keymap);
  await (0, import_promises15.mkdir)(import_node_path15.default.join(root, "editor/db"), { recursive: true });
  const db = import_node_path15.default.join(root, "editor/db/workspace.sqlite");
  await (0, import_promises15.writeFile)(db, "opaque-workspace-layout");
  const first = await launch(root);
  let saved = parse2(await (0, import_promises15.readFile)(file, "utf8"));
  import_strict5.default.equal(saved.ui_font_size, 22);
  import_strict5.default.equal(saved.agent_ui_font_size, 24);
  import_strict5.default.equal(saved.agent_buffer_font_size, 20);
  import_strict5.default.equal(saved.agent_ui_font_family, "Malgun Gothic");
  import_strict5.default.equal(saved.buffer_font_family, "Consolas");
  import_strict5.default.equal(saved.terminal.font_size, 18);
  import_strict5.default.equal(saved.terminal.shell, void 0);
  import_strict5.default.equal(saved.agent.tool_permissions, void 0);
  import_strict5.default.equal(saved.agent.dock, "left");
  import_strict5.default.equal(saved.agent.default_width, 520);
  import_strict5.default.equal(saved.agent.threads_sidebar.position, "right");
  import_strict5.default.equal(saved.project_panel.dock, "right");
  import_strict5.default.equal(saved.restore_on_startup, "last_session");
  import_strict5.default.equal(saved.theme, void 0);
  import_strict5.default.equal(saved.languages["C++"].tab_size, 8);
  import_strict5.default.ok(!JSON.stringify(saved).includes("untrusted"));
  import_strict5.default.equal(saved.telemetry.metrics, false);
  import_strict5.default.deepEqual(Object.keys(saved.agent_servers), ["Ned"]);
  import_strict5.default.match(await (0, import_promises15.readFile)(file, "utf8"), /MY_LAYOUT/);
  import_strict5.default.match(await (0, import_promises15.readFile)(file, "utf8"), /MY_FONT/);
  import_strict5.default.equal(await (0, import_promises15.readFile)(import_node_path15.default.join(root, "editor/config/settings.before-ned-0.3.3.jsonc"), "utf8"), original);
  await (0, import_promises15.writeFile)(file, (await (0, import_promises15.readFile)(file, "utf8")).replace('"ui_font_size": 22', '"ui_font_size": 25'));
  const second = await launch(root, "two");
  saved = parse2(await (0, import_promises15.readFile)(file, "utf8"));
  import_strict5.default.equal(saved.ui_font_size, 25);
  import_strict5.default.equal(saved.agent.dock, "left");
  import_strict5.default.equal(saved.agent_servers.Ned.command, "/Ned-two");
  import_strict5.default.equal(saved.agent_servers.Ned.args[0], "/resources-two/ned/agent.cjs");
  import_strict5.default.equal(second.data, first.data);
  import_strict5.default.equal(await (0, import_promises15.readFile)(keymapFile(root), "utf8"), keymap);
  import_strict5.default.equal(await (0, import_promises15.readFile)(db, "utf8"), "opaque-workspace-layout");
  import_strict5.default.equal(await (0, import_promises15.readFile)(import_node_path15.default.join(root, "editor/config/settings.before-ned-0.3.3.jsonc"), "utf8"), original);
});
function keymapFile(root) {
  return import_node_path15.default.join(root, "editor/config/keymap.json");
}
(0, import_node_test5.test)("malformed/duplicate editor settings and linked keymaps are preserved without silent resetting", async (t) => {
  const root = await fixture2(t), file = import_node_path15.default.join(root, "editor/config/settings.json");
  for (const text of ['{"ui_font_size":', '{"ui_font_size":18,"ui_font_size":24}']) {
    await (0, import_promises15.writeFile)(file, text);
    await import_strict5.default.rejects(launch(root), /JSONC/);
    import_strict5.default.equal(await (0, import_promises15.readFile)(file, "utf8"), text);
  }
  await (0, import_promises15.writeFile)(file, "{}");
  const other = import_node_path15.default.join(root, "other-keys");
  await (0, import_promises15.writeFile)(other, "[]");
  await (0, import_promises15.symlink)(other, keymapFile(root));
  await import_strict5.default.rejects(launch(root), /일반 파일/);
  import_strict5.default.equal(await (0, import_promises15.readFile)(other, "utf8"), "[]");
});
(0, import_node_test5.test)("a new editor starts blank and creates the default keymap once; appearance is only a missing-file migration fallback", async (t) => {
  const root = await fixture2(t);
  await (0, import_promises15.writeFile)(import_node_path15.default.join(root, "editor/appearance.json"), '{"ui_font_size":21}');
  await launch(root);
  const file = import_node_path15.default.join(root, "editor/config/settings.json");
  let value = parse2(await (0, import_promises15.readFile)(file, "utf8"));
  import_strict5.default.equal(value.ui_font_size, 21);
  import_strict5.default.equal(value.restore_on_startup, "launchpad");
  import_strict5.default.match(await (0, import_promises15.readFile)(keymapFile(root), "utf8"), /NewExternalAgentThread/);
  delete value.ui_font_size;
  await (0, import_promises15.writeFile)(file, JSON.stringify(value));
  await launch(root);
  value = parse2(await (0, import_promises15.readFile)(file, "utf8"));
  import_strict5.default.equal(value.ui_font_size, void 0);
});
(0, import_node_test5.test)("UTF-8 BOM and comment-only editor settings survive managed preference updates", async (t) => {
  const root = await fixture2(t), file = import_node_path15.default.join(root, "editor/config/settings.json");
  await (0, import_promises15.writeFile)(file, '\uFEFF// UTF8_NOTE\n{"ui_font_size":23,}\n');
  await launch(root);
  let text = await (0, import_promises15.readFile)(file, "utf8");
  import_strict5.default.ok(text.startsWith("\uFEFF"));
  import_strict5.default.match(text, /UTF8_NOTE/);
  import_strict5.default.equal(parse2(text.slice(1)).ui_font_size, 23);
  await (0, import_promises15.writeFile)(file, "// ONLY_NOTE\n");
  await launch(root);
  text = await (0, import_promises15.readFile)(file, "utf8");
  import_strict5.default.match(text, /ONLY_NOTE/);
  import_strict5.default.equal(parse2(text).restore_on_startup, "launchpad");
});

// tests/openviking.integration.test.ts
var import_node_test6 = require("node:test");
var import_strict6 = __toESM(require("node:assert/strict"), 1);
var import_node_fs5 = require("node:fs");
var import_promises19 = require("node:fs/promises");
var import_node_http4 = require("node:http");
var import_node_os6 = require("node:os");
var import_node_path19 = __toESM(require("node:path"), 1);

// src/main/http-request.ts
var import_node_http2 = require("node:http");
var import_node_https = require("node:https");
function requestJSON(url, options = {}) {
  const target = new URL(url);
  if (!["http:", "https:"].includes(target.protocol)) throw new Error("Unsupported HTTP protocol");
  return new Promise((resolve, reject) => {
    let request, response, settled = false;
    const cleanup = () => options.signal?.removeEventListener("abort", cancel);
    const fail = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      request?.destroy();
      response?.destroy();
      reject(error);
    };
    const cancel = () => fail(options.signal?.reason ?? new DOMException("Request cancelled", "AbortError"));
    if (options.signal?.aborted) {
      cancel();
      return;
    }
    options.signal?.addEventListener("abort", cancel, { once: true });
    const body = options.body === void 0 ? void 0 : Buffer.from(options.body);
    try {
      request = (target.protocol === "https:" ? import_node_https.request : import_node_http2.request)(target, {
        method: options.method ?? "POST",
        agent: false,
        headers: { ...options.headers, ...body ? { "Content-Length": String(body.length) } : {} }
      }, (incoming) => {
        response = incoming;
        const chunks = [];
        let size = 0;
        incoming.on("data", (bytes) => {
          size += bytes.length;
          if (size > (options.maxBytes ?? 32 * 1024 * 1024)) fail(new Error("HTTP response exceeds size limit"));
          else chunks.push(bytes);
        });
        incoming.once("aborted", () => fail(new Error("HTTP response connection closed unexpectedly")));
        incoming.once("error", fail);
        incoming.once("end", () => {
          if (settled) return;
          try {
            const status = incoming.statusCode ?? 502;
            const value = new Response([204, 205, 304].includes(status) ? null : Buffer.concat(chunks), {
              status,
              headers: { "Content-Type": String(incoming.headers["content-type"] ?? "application/json") }
            });
            settled = true;
            cleanup();
            resolve(value);
          } catch (error) {
            fail(error);
          }
        });
      });
      request.on("socket", (socket) => socket.setKeepAlive(true, 6e4));
      request.once("error", fail);
      request.end(body);
    } catch (error) {
      fail(error);
    }
  });
}

// python-runtime-lock.json
var python_runtime_lock_default = {
  schemaVersion: 1,
  python: {
    version: "3.12.16",
    url: "https://github.com/astral-sh/python-build-standalone/releases/download/20261026/cpython-3.12.16+20261026-x86_64-pc-windows-msvc-install_only_stripped.tar.gz",
    sha256: "1f2ab53880fc67ea323398c6388e05af28addc99a8e389209f08a51fdff4b149"
  },
  packages: [
    {
      name: "aiodns",
      version: "4.0.4",
      url: "https://files.pythonhosted.org/packages/7f/70/72e4ab117425ccdc4d10bd523a94c1baa051a15586057d64a4c6888f9e3f/aiodns-4.0.4-py3-none-any.whl",
      sha256: "c24dd605bac70a1676ce503f967a98483ff163507198557d8e9db16267e6cfd2",
      license: "MIT"
    },
    {
      name: "aioftp",
      version: "0.28.3",
      url: "https://files.pythonhosted.org/packages/3c/f0/a0d7a27907e2a825ee14ced143122eb3feff0f4b697f5ec76695dbb92dd2/aioftp-0.28.3-py3-none-any.whl",
      sha256: "1d40f1a790efa614df1ffbd3ea68d6cebf8ce89ef544f234801d7e8950445638",
      license: `Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
`
    },
    {
      name: "aiohappyeyeballs",
      version: "2.7.1",
      url: "https://files.pythonhosted.org/packages/71/43/1947f06babed6b3f1d7f38b0c767f52df66bfb2bc10b468c4a7de9eceff2/aiohappyeyeballs-2.7.1-py3-none-any.whl",
      sha256: "9243213661e29250eb41368e5daa826fc017156c3b8a11440826b2e3ed376472",
      license: "PSF-2.0"
    },
    {
      name: "aiohttp",
      version: "3.14.5",
      url: "https://files.pythonhosted.org/packages/ae/ce/1f08114679d49655b30a6e0a29858375c94b82c1de1a0bd0a20c2fee8b02/aiohttp-3.14.5-cp312-cp312-win_amd64.whl",
      sha256: "2cc38a4f2b516bef1714e690df87a0e043faf1a7693c82d860091684453d5111",
      license: "Apache-2.0 AND MIT"
    },
    {
      name: "aiosignal",
      version: "1.4.0",
      url: "https://files.pythonhosted.org/packages/fb/76/641ae371508676492379f16e2fa48f4e2c11741bd63c48be4b12a6b09cba/aiosignal-1.4.0-py3-none-any.whl",
      sha256: "053243f8b92b990551949e63930a839ff0cf0b0ebbe0597b0f3fb19e1a0fe82e",
      license: "Apache 2.0"
    },
    {
      name: "annotated-doc",
      version: "0.0.5",
      url: "https://files.pythonhosted.org/packages/3e/30/e900b21425a860e195f32e37657aa1f7c7f2b1bfb26f03ca209b90933c06/annotated_doc-0.0.5-py3-none-any.whl",
      sha256: "117bac03a25ede5df5440e855b32d556049ca169ead221505badf432fed4b101",
      license: "MIT"
    },
    {
      name: "annotated-types",
      version: "0.8.0",
      url: "https://files.pythonhosted.org/packages/99/91/8acff4f5e50511b911bbccb72b8628a49c68ce14148cd9f6431094859a90/annotated_types-0.8.0-py3-none-any.whl",
      sha256: "f072f4d804ea359e4eaf198b1af7a8b0943881a87f31bb764f8bf219bb9419e0",
      license: "MIT"
    },
    {
      name: "anyio",
      version: "4.16.0",
      url: "https://files.pythonhosted.org/packages/a9/16/7757fb84c819accc7d7e9af5291b261e4abb8627ee040f99e7d35ef2457a/anyio-4.16.0-py3-none-any.whl",
      sha256: "c66ae634e0b8228396b801741beb3294326d4b6102f7bba4041c0dfb58c29026",
      license: "MIT"
    },
    {
      name: "APScheduler",
      version: "3.11.3",
      url: "https://files.pythonhosted.org/packages/42/c9/8638db32514dbb9157b3d82680c6faea89283523edf9ed2415ea3884f2ae/apscheduler-3.11.3-py3-none-any.whl",
      sha256: "bbeb2ec02d23d3c06a6c07ed7f0f3939ada6680eb121fae809a69bb42c537a30",
      license: "MIT"
    },
    {
      name: "argon2-cffi",
      version: "25.1.0",
      url: "https://files.pythonhosted.org/packages/4f/d3/a8b22fa575b297cd6e3e3b0155c7e25db170edf1c74783d6a31a2490b8d9/argon2_cffi-25.1.0-py3-none-any.whl",
      sha256: "fdc8b074db390fccb6eb4a3604ae7231f219aa669a2652e0f20e16ba513d5741",
      license: "MIT"
    },
    {
      name: "argon2-cffi-bindings",
      version: "26.1.0",
      url: "https://files.pythonhosted.org/packages/6d/3a/0cc14a05810e6add9bce5e87693334baa2222de5f647fa31781885b6573f/argon2_cffi_bindings-26.1.0-cp310-abi3-win_amd64.whl",
      sha256: "2c36ff87b5dfaa477d0bd51e9d7f6abdae7c8955d2983c97419085d842154b3e",
      license: "MIT"
    },
    {
      name: "async-timeout",
      version: "5.0.1",
      url: "https://files.pythonhosted.org/packages/fe/ba/e2081de779ca30d473f21f5b30e0e737c438205440784c7dfc81efc2b029/async_timeout-5.0.1-py3-none-any.whl",
      sha256: "39e3809566ff85354557ec2398b55e096c8364bacac9405a7a1fa429e77fe76c",
      license: "Apache 2"
    },
    {
      name: "attrs",
      version: "26.1.0",
      url: "https://files.pythonhosted.org/packages/64/b4/17d4b0b2a2dc85a6df63d1157e028ed19f90d4cd97c36717afef2bc2f395/attrs-26.1.0-py3-none-any.whl",
      sha256: "c647aa4a12dfbad9333ca4e71fe62ddc36f4e63b2d260a37a8b83d2f043ac309",
      license: "MIT"
    },
    {
      name: "Automat",
      version: "25.4.16",
      url: "https://files.pythonhosted.org/packages/02/ff/1175b0b7371e46244032d43a56862d0af455823b5280a50c63d99cc50f18/automat-25.4.16-py3-none-any.whl",
      sha256: "04e9bce696a8d5671ee698005af6e5a9fa15354140a87f4870744604dcdd3ba1",
      license: 'Copyright (c) 2014\nRackspace\n\nPermission is hereby granted, free of charge, to any person obtaining\na copy of this software and associated documentation files (the\n"Software"), to deal in the Software without restriction, including\nwithout limitation the rights to use, copy, modify, merge, publish,\ndistribute, sublicense, and/or sell copies of the Software, and to\npermit persons to whom the Software is furnished to do so, subject to\nthe following conditions:\n\nThe above copyright notice and this permission notice shall be\nincluded in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,\nEXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\nMERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND\nNONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE\nLIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION\nOF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION\nWITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n'
    },
    {
      name: "babel",
      version: "2.18.0",
      url: "https://files.pythonhosted.org/packages/77/f5/21d2de20e8b8b0408f0681956ca2c69f1320a3848ac50e6e7f39c6159675/babel-2.18.0-py3-none-any.whl",
      sha256: "e2b422b277c2b9a9630c1d7903c2a00d0830c409c59ac8cae9081c92f1aeba35",
      license: "BSD-3-Clause"
    },
    {
      name: "backports.zstd",
      version: "1.8.0",
      url: "https://files.pythonhosted.org/packages/a5/78/2f497fd2bbf46099e46650f75467967d21f25bb921c894d28d493bbfb7e4/backports_zstd-1.8.0-cp312-cp312-win_amd64.whl",
      sha256: "1eddf59fedaf19dd3a8e9c597add7eb6f0d51d4467a0924b2dcd2c118ed18ff5",
      license: "PSF-2.0"
    },
    {
      name: "beautifulsoup4",
      version: "4.15.0",
      url: "https://files.pythonhosted.org/packages/88/c6/92fcd42f1ba33e1184263f25bfabf3d27c383410470f169e4b8163bf9c17/beautifulsoup4-4.15.0-py3-none-any.whl",
      sha256: "d6f88de62e1d4e38ecb1077eb9724cd0eff29d2a08ca16a401e9b9e93f117cf9",
      license: "MIT License"
    },
    {
      name: "boto3",
      version: "1.43.127",
      url: "https://files.pythonhosted.org/packages/40/48/f562f1240da499614a19bdf5d54dbdbfea5cffabbdd2703c3a413e0c13a1/boto3-1.43.127-py3-none-any.whl",
      sha256: "47f87f89b10e62f5191bd98674beb0dd52ed368c19fcdfef2ef38ead31126f49",
      license: "Apache-2.0"
    },
    {
      name: "botocore",
      version: "1.43.127",
      url: "https://files.pythonhosted.org/packages/4b/db/bee0401fd3f8cf1e2404044a4e3156dc7e064c2b1fc7162df2d795941cd8/botocore-1.43.127-py3-none-any.whl",
      sha256: "aa0e3188679a2164a2098a14ea9b59520520cb573aaee9999d852480691e134a",
      license: "Apache-2.0"
    },
    {
      name: "brotli",
      version: "1.2.1",
      url: "https://files.pythonhosted.org/packages/3e/82/b7f6c56393f2224ff4108cf1cc255921be1c0ae5962163edbe367c8a55bc/brotli-1.2.1-cp312-cp312-win_amd64.whl",
      sha256: "f5342b8256476554b4045db8b7bf4dc4044d0405485f220f0cd80764bc0d7faf",
      license: "MIT"
    },
    {
      name: "cairocffi",
      version: "1.7.1",
      url: "https://files.pythonhosted.org/packages/93/d8/ba13451aa6b745c49536e87b6bf8f629b950e84bd0e8308f7dc6883b67e2/cairocffi-1.7.1-py3-none-any.whl",
      sha256: "9803a0e11f6c962f3b0ae2ec8ba6ae45e957a146a004697a1ac1bbf16b073b3f",
      license: "See bundled dist-info license files"
    },
    {
      name: "CairoSVG",
      version: "2.9.1",
      url: "https://files.pythonhosted.org/packages/41/51/8041c2e70649e5b7f2a0aedbbbd0609ac099cfaa0cbde2014279c9c05756/cairosvg-2.9.1-py3-none-any.whl",
      sha256: "f91c5628e834be024a0ed4544d76261cd84016a4c73bcdf26c386495825c05a1",
      license: "LGPL-3.0-or-later"
    },
    {
      name: "certifi",
      version: "2026.10.23",
      url: "https://files.pythonhosted.org/packages/32/d1/a3652fe2c19134d0d15922177821d863cbd7e842d53a21bbe7e8e3a1b5ac/certifi-2026.10.23-py3-none-any.whl",
      sha256: "e9b54de76e530bb6cf0ccd036787103acb58fd42ba930ea8bf948ddbaa2f61d1",
      license: "MPL-2.0"
    },
    {
      name: "cffi",
      version: "2.1.1",
      url: "https://files.pythonhosted.org/packages/d9/79/615cc094e2fb508cade7de88d3b4f6c4ec2bab695c97bce9153dc65aadf5/cffi-2.1.1-cp312-cp312-win_amd64.whl",
      sha256: "f53e442b08449d42821fa4a4fba000095af9f62742a500f978a9f557ec44339a",
      license: "MIT-0"
    },
    {
      name: "charset-normalizer",
      version: "3.5.2",
      url: "https://files.pythonhosted.org/packages/eb/e6/e6e083884cbcfd49c64865af05027fe7011be7b2d9179524f099a1b611f3/charset_normalizer-3.5.2-cp312-cp312-win_amd64.whl",
      sha256: "780fbe7cab297b81dad9fb8dc5eb003c0468ffb0d9e5f65068c53a34661a96bc",
      license: "MIT"
    },
    {
      name: "click",
      version: "8.5.1",
      url: "https://files.pythonhosted.org/packages/31/7d/164b7ffc8624fe9efb4221bf9af485d5c1e41b9ae118045d2b6dc5457d8b/click-8.5.1-py3-none-any.whl",
      sha256: "8bb5376d2006950386f8c6427613334a2acadc5f559cb80e638d00b4df957e37",
      license: "BSD-3-Clause"
    },
    {
      name: "colorama",
      version: "0.4.6",
      url: "https://files.pythonhosted.org/packages/d1/d6/3965ed04c63042e047cb6a3e6ed1a63a35087b6a609aa3a15ed8ac56c221/colorama-0.4.6-py2.py3-none-any.whl",
      sha256: "4f1d9991f5acc0ca119f9d443620b77f9d6b33703e51011c16baf57afb285fc6",
      license: "See bundled dist-info license files"
    },
    {
      name: "constantly",
      version: "23.10.4",
      url: "https://files.pythonhosted.org/packages/b8/40/c199d095151addf69efdb4b9ca3a4f20f70e20508d6222bffb9b76f58573/constantly-23.10.4-py3-none-any.whl",
      sha256: "3fd9b4d1c3dc1ec9757f3c52aef7e53ad9323dbe39f51dfd4c43853b68dfa3f9",
      license: "MIT"
    },
    {
      name: "courlan",
      version: "1.4.0",
      url: "https://files.pythonhosted.org/packages/1f/38/ce65091ff20a16e06d17418c4353af5f56d3190821b1a06983c79ae79274/courlan-1.4.0-py3-none-any.whl",
      sha256: "ad1dbdefd912ca7238d4607dc855df5df097f56bac175dd662c84eed3802f49e",
      license: "Apache-2.0"
    },
    {
      name: "cryptography",
      version: "50.0.2",
      url: "https://files.pythonhosted.org/packages/9a/4f/adfc442765721292fff86d314ce385d3249d22db42295c0dd057727b60f3/cryptography-50.0.2-cp311-abi3-win_amd64.whl",
      sha256: "7afa5a6602a9f29af1f3a2965f831bae7c9d5d597b7cbb716d41ab3b7d89879c",
      license: "Apache-2.0 OR BSD-3-Clause"
    },
    {
      name: "cssselect",
      version: "1.6.0",
      url: "https://files.pythonhosted.org/packages/08/ae/f24b3aac56ba91a29c9d3a31c07a9ad4e9eb500e5d212742bb6d348edaef/cssselect-1.6.0-py3-none-any.whl",
      sha256: "6df6eab9b264c0f2092a6e386b33610e1684a25e27925ecebe25e3d97cbf3525",
      license: "BSD-3-Clause"
    },
    {
      name: "cssselect2",
      version: "0.10.1",
      url: "https://files.pythonhosted.org/packages/bd/59/6b1daa3b94de8970e2a2787ba73616c2d0675d2f948ef4cad8bef7f21bc6/cssselect2-0.10.1-py3-none-any.whl",
      sha256: "25cc4494d55985d6a6da359be48da6ce98c28dcbafa2314c383ace3fc32ec868",
      license: "See bundled dist-info license files"
    },
    {
      name: "dateparser",
      version: "1.5.0",
      url: "https://files.pythonhosted.org/packages/7f/58/73739bc1e168f309aeb8cc29b5866a134da8dbd4f69af947fc93462f1e33/dateparser-1.5.0-py3-none-any.whl",
      sha256: "7c4e088f25458f57db391510035af0878439a6df71d159318dcdb0a7553932e3",
      license: "BSD-3-Clause"
    },
    {
      name: "decorator",
      version: "5.3.1",
      url: "https://files.pythonhosted.org/packages/05/7f/798705f5296a58ca505d600456748d1be48078eac8a7050d8a98bc9edb89/decorator-5.3.1-py3-none-any.whl",
      sha256: "f47fe6fdbd2edd623ecfe36875d37aba411624e2670dd395dddae1358689bb3c",
      license: "BSD-2-Clause"
    },
    {
      name: "defusedxml",
      version: "0.7.1",
      url: "https://files.pythonhosted.org/packages/07/6c/aa3f2f849e01cb6a001cd8554a88d4c77c5c1a31c95bdf1cf9301e6d9ef4/defusedxml-0.7.1-py2.py3-none-any.whl",
      sha256: "a352e7e428770286cc899e2542b6cdaedb2b4953ff269a210103ec58f6198a61",
      license: "PSFL"
    },
    {
      name: "distro",
      version: "1.9.0",
      url: "https://files.pythonhosted.org/packages/12/b3/231ffd4ab1fc9d679809f356cebee130ac7daa00d6d6f3206dd4fd137e9e/distro-1.9.0-py3-none-any.whl",
      sha256: "7bffd925d65168f85027d8da9af6bddab658135b840670a223589bc0c8ef02b2",
      license: "Apache License, Version 2.0"
    },
    {
      name: "fastapi",
      version: "0.162.2",
      url: "https://files.pythonhosted.org/packages/d6/fb/0dc0f819163bc6b7f9e6802d7d0b1ac180fbbe4e75dbd10655c6a4d77796/fastapi-0.162.2-py3-none-any.whl",
      sha256: "d0584f9662317e01140df94c64f4bed1d8b059fe35496e30c9c92f70e6e5ff15",
      license: "MIT"
    },
    {
      name: "fastuuid",
      version: "0.14.0",
      url: "https://files.pythonhosted.org/packages/cc/fc/f5c799a6ea6d877faec0472d0b27c079b47c86b1cdc577720a5386483b36/fastuuid-0.14.0-cp312-cp312-win_amd64.whl",
      sha256: "d9e4332dc4ba054434a9594cbfaf7823b57993d7d8e7267831c3e059857cf397",
      license: "See bundled dist-info license files"
    },
    {
      name: "feedparser",
      version: "6.0.14",
      url: "https://files.pythonhosted.org/packages/7f/61/f04912e63702e73fb2a378f9c0a1ad9eb17a334a11a6b3fe1daa593903c2/feedparser-6.0.14-py3-none-any.whl",
      sha256: "e35e3f760151b0c3b22cac9684155cae186a233e16c49bcbc6c49e91e3131137",
      license: "BSD-2-Clause"
    },
    {
      name: "feedparser-sgmllib",
      version: "2.1.0",
      url: "https://files.pythonhosted.org/packages/85/a0/79a31f898092e145bd66e2b338fb0656979acb2bbbcae8220940fbfcd820/feedparser_sgmllib-2.1.0-py3-none-any.whl",
      sha256: "2cab2d43b95a954f920f18aebce7a4dbbb3f539780b127e2aa114f579821e01d",
      license: "PSF-2.0"
    },
    {
      name: "filelock",
      version: "4.2.10",
      url: "https://files.pythonhosted.org/packages/ef/90/5d0096a325aa0f83ba7a3968bfb485b67e32c947bdf9cd0fcb4b485be718/filelock-4.2.10-py3-none-any.whl",
      sha256: "9479aaeb4db20b5a53e3da28493edd24720b66b8a0b84030aa56ccdf243d6857",
      license: "MIT"
    },
    {
      name: "firecrawl-anydoc",
      version: "0.2.4",
      url: "https://files.pythonhosted.org/packages/65/34/6d54fed906055e5507dd94efd63f4a05021f103dc684ea62a3b0876b7595/firecrawl_anydoc-0.2.4-cp310-abi3-win_amd64.whl",
      sha256: "7c9ffc81946e6954c124560ed1d395e0103a1a08fdc0f6be382e2f35daf6dbc9",
      license: "MIT"
    },
    {
      name: "formerly",
      version: "0.1.0",
      url: "https://files.pythonhosted.org/packages/9c/21/99cb05c0928fce1bd1b22a873d7ac94847af789ca35a43e34e9c34ded0f4/formerly-0.1.0-py3-none-any.whl",
      sha256: "96dc14b85d8288eda824fa1f1521a1b070252fea9fb17d2bc7134c6661b7c556",
      license: "BSD-3-Clause"
    },
    {
      name: "frostwork",
      version: "0.2.2",
      url: "https://files.pythonhosted.org/packages/f9/df/e0b6ff0b76c4023c1ae68157882be2f431ce234b0fc72b03d380ad71c0a1/frostwork-0.2.2-cp310-abi3-win_amd64.whl",
      sha256: "a4f0956321c95139353916036bbf4a94e4c5d82a43c22833da3d4a05da8a1780",
      license: "Apache-2.0"
    },
    {
      name: "frozenlist",
      version: "1.8.0",
      url: "https://files.pythonhosted.org/packages/b8/af/38e51a553dd66eb064cdf193841f16f077585d4d28394c2fa6235cb41765/frozenlist-1.8.0-cp312-cp312-win_amd64.whl",
      sha256: "34187385b08f866104f0c0617404c8eb08165ab1272e884abc89c112e9c00746",
      license: "Apache-2.0"
    },
    {
      name: "fsspec",
      version: "2026.9.0",
      url: "https://files.pythonhosted.org/packages/6c/c0/a98505f18594f1bce828bb159cec0fcf9860562f1a2c85913409fc8f3d9e/fsspec-2026.9.0-py3-none-any.whl",
      sha256: "8dd6e646e99ea382bd85f97a45e6b526a442d79423a7dc673f1e2756d05fcb5f",
      license: "BSD-3-Clause"
    },
    {
      name: "google",
      version: "3.0.0",
      url: "https://files.pythonhosted.org/packages/ac/35/17c9141c4ae21e9a29a43acdfd848e3e468a810517f862cad07977bf8fe9/google-3.0.0-py2.py3-none-any.whl",
      sha256: "889cf695f84e4ae2c55fbc0cfdaf4c1e729417fa52ab1db0485202ba173e4935",
      license: "UNKNOWN"
    },
    {
      name: "googleapis-common-protos",
      version: "1.76.0",
      url: "https://files.pythonhosted.org/packages/05/6d/78dc67a9e779e594b49bf62604034d3a6aa428a55afc729cafda4b7333e1/googleapis_common_protos-1.76.0-py3-none-any.whl",
      sha256: "59e13344a9f3651aa201a03e2bee815a3bf43a4baf1f9ff8a9b62a840ce25fac",
      license: "Apache-2.0"
    },
    {
      name: "graphifyy",
      version: "0.9.105",
      url: "https://files.pythonhosted.org/packages/d7/9b/8629af3c8cc90c0099e5809a53879ddbdb13cc24624c4a24fc132ba26dfb/graphifyy-0.9.105-py3-none-any.whl",
      sha256: "cc28c042c9031b2e07088506e576dc67b88a7dc86fb8a34b96a687bc27c2eae4",
      license: "Apache-2.0"
    },
    {
      name: "grep-ast",
      version: "0.9.0",
      url: "https://files.pythonhosted.org/packages/40/79/29f1373b2ce1eec37c03aefbc17194c2470d8b61ede288e5043231825999/grep_ast-0.9.0-py3-none-any.whl",
      sha256: "a3973dca99f1abc026a01bbbc70e00a63860c8ff94a56182ff18b089836826d7",
      license: "See bundled dist-info license files"
    },
    {
      name: "grpcio",
      version: "1.85.1",
      url: "https://files.pythonhosted.org/packages/dd/48/4030a63540089d00a36cea15282623bcf084a5ea4c0ffc4685a42ef0f342/grpcio-1.85.1-cp312-cp312-win_amd64.whl",
      sha256: "eaad7e6aa9ac3aded4f6bc86a18bf2cff3de356f972bf32a5558df9788085b85",
      license: "Apache-2.0"
    },
    {
      name: "h11",
      version: "0.16.0",
      url: "https://files.pythonhosted.org/packages/04/4b/29cac41a4d98d144bf5f6d33995617b185d14b22401f75ca86f384e87ff1/h11-0.16.0-py3-none-any.whl",
      sha256: "63cf8bbe7522de3bf65932fda1d9c2772064ffb3dae62d55932da54b31cb6c86",
      license: "MIT"
    },
    {
      name: "hf-xet",
      version: "1.8.0",
      url: "https://files.pythonhosted.org/packages/97/4d/2c76a992b370ff77d0b5219275779f8c9a7dabb8ee649deb265dfed84d0f/hf_xet-1.8.0-cp38-abi3-win_amd64.whl",
      sha256: "92188598dedc1e1f5609bd718d4db8687a6c89915553912571e2f587892eecec",
      license: "Apache-2.0"
    },
    {
      name: "htmldate",
      version: "1.11.0",
      url: "https://files.pythonhosted.org/packages/42/f8/6139fc95b889f44e9a4b373778f10315ade81b395a6298adf3c08415de64/htmldate-1.11.0-py3-none-any.whl",
      sha256: "2a5a0d80cce38d3f986a64bb9ab64ba03e5953159b38fd78a841492131ead348",
      license: "Apache-2.0"
    },
    {
      name: "httpcore",
      version: "1.0.9",
      url: "https://files.pythonhosted.org/packages/7e/f5/f66802a942d491edb555dd61e3a9961140fd64c90bce1eafd741609d334d/httpcore-1.0.9-py3-none-any.whl",
      sha256: "2d400746a40668fc9dec9810239072b40b4484b640a8c38fd654a024c7a1bf55",
      license: "BSD-3-Clause"
    },
    {
      name: "httpcore2",
      version: "2.16.0",
      url: "https://files.pythonhosted.org/packages/af/c2/ce417c397afa5181f0e3c6ff01a4d01639414e1adef08730d97571297151/httpcore2-2.16.0-py3-none-any.whl",
      sha256: "5c4358319f2602d984ad93182c9fee5160f22e9da7babdda870a5e7c4e2dc34f",
      license: "BSD-3-Clause"
    },
    {
      name: "httpx",
      version: "0.28.1",
      url: "https://files.pythonhosted.org/packages/2a/39/e50c7c3a983047577ee07d2a9e53faf5a69493943ec3f6a384bdc792deb2/httpx-0.28.1-py3-none-any.whl",
      sha256: "d909fcccc110f8c7faf814ca82a9a4d816bc5a6dbfea25d6591d6985b8ba59ad",
      license: "BSD-3-Clause"
    },
    {
      name: "httpx-sse",
      version: "0.4.3",
      url: "https://files.pythonhosted.org/packages/d2/fd/6668e5aec43ab844de6fc74927e155a3b37bf40d7c3790e49fc0406b6578/httpx_sse-0.4.3-py3-none-any.whl",
      sha256: "0ac1c9fe3c0afad2e0ebb25a934a59f4c7823b60792691f779fad2c5568830fc",
      license: "MIT"
    },
    {
      name: "httpx2",
      version: "2.16.0",
      url: "https://files.pythonhosted.org/packages/7b/3d/2e4bc4fd1ef9770871669adb348d612a6e4786b303a23f9935b81c48dd60/httpx2-2.16.0-py3-none-any.whl",
      sha256: "fd2c5d7909e8d86fe92d53020c310ca0e4e431b838c207c5754b9bbf0308d49a",
      license: "BSD-3-Clause"
    },
    {
      name: "huggingface_hub",
      version: "2.4.0",
      url: "https://files.pythonhosted.org/packages/d4/55/ff47f1b082ecf5f43f4bc1e3b932d68eead171dabbbd1a92666c686301d7/huggingface_hub-2.4.0-py3-none-any.whl",
      sha256: "42ecfd93ede47bdd333daebbf66a32d7bfe2e18752754fe4d2d4f98a0179d801",
      license: "Apache-2.0"
    },
    {
      name: "hyperlink",
      version: "21.0.0",
      url: "https://files.pythonhosted.org/packages/6e/aa/8caf6a0a3e62863cbb9dab27135660acba46903b703e224f14f447e57934/hyperlink-21.0.0-py2.py3-none-any.whl",
      sha256: "e6b14c37ecb73e89c77d78cdb4c2cc8f3fb59a885c5b3f819ff4ed80f25af1b4",
      license: "MIT"
    },
    {
      name: "idna",
      version: "3.20",
      url: "https://files.pythonhosted.org/packages/58/a2/bb081bab032533a855d44de1d56f8e8426114ff1ba5d1f07a438a0a654f8/idna-3.20-py3-none-any.whl",
      sha256: "ab7ae7122974553370f0bdb919e1a960b2cd1bc1ef0276416d896db81c14582c",
      license: "BSD-3-Clause"
    },
    {
      name: "importlib_metadata",
      version: "8.9.0",
      url: "https://files.pythonhosted.org/packages/7d/f9/97f2ca8bb3ec6e4b1d64f983ebe98b9a192faddff67fac3d6303a537e670/importlib_metadata-8.9.0-py3-none-any.whl",
      sha256: "e0f761b6ea91ced3b0844c14c9d955224d538105921f8e6754c00f6ca79fba7f",
      license: "Apache-2.0"
    },
    {
      name: "Incremental",
      version: "24.11.0",
      url: "https://files.pythonhosted.org/packages/1d/55/0f4df2a44053867ea9cbea73fc588b03c55605cd695cee0a3d86f0029cb2/incremental-24.11.0-py3-none-any.whl",
      sha256: "a34450716b1c4341fe6676a0598e88a39e04189f4dce5dc96f656e040baa10b3",
      license: "See bundled dist-info license files"
    },
    {
      name: "itemadapter",
      version: "0.14.0",
      url: "https://files.pythonhosted.org/packages/65/4b/022994816dceb15b70df2b588a48adec8c03e6f14afb14ad2ab89f90f32c/itemadapter-0.14.0-py3-none-any.whl",
      sha256: "ae3954d56143a8aeb1e637e00dfb8ff46dfd1dd214f76d138e5520fcf293ed00",
      license: "BSD-3-Clause"
    },
    {
      name: "itemloaders",
      version: "1.5.0",
      url: "https://files.pythonhosted.org/packages/7e/ad/44f03332459d62d921e62b76b4bd699382ee5e7aa29b7d9fc7be934a8341/itemloaders-1.5.0-py3-none-any.whl",
      sha256: "d57a4e5b204a1f88affdc6e03ed2f4f60ad7f3b7cc90f5914af92c9b52e46efb",
      license: "BSD-3-Clause"
    },
    {
      name: "Jinja2",
      version: "3.1.6",
      url: "https://files.pythonhosted.org/packages/62/a1/3d680cbfd5f4b8f15abc1d571870c5fc3e594bb582bc3b64ea099db13e56/jinja2-3.1.6-py3-none-any.whl",
      sha256: "85ece4451f492d0c13c5dd7c13a64681a86afae63a5f347908daf103ce6d2f67",
      license: "See bundled dist-info license files"
    },
    {
      name: "jiter",
      version: "0.19.0",
      url: "https://files.pythonhosted.org/packages/10/7f/9d1dd194cc52698a9c7116b0b464826cc1a2feda2afd12fa562182ff27d6/jiter-0.19.0-cp312-cp312-win_amd64.whl",
      sha256: "f64154096d9aa5462ef3c4f48d624492602d0073d54d30c20c08793387f67e42",
      license: "MIT"
    },
    {
      name: "jmespath",
      version: "1.1.0",
      url: "https://files.pythonhosted.org/packages/14/2f/967ba146e6d58cf6a652da73885f52fc68001525b4197effc174321d70b4/jmespath-1.1.0-py3-none-any.whl",
      sha256: "a5663118de4908c91729bea0acadca56526eb2698e83de10cd116ae0f4e97c64",
      license: "MIT"
    },
    {
      name: "json_repair",
      version: "0.64.9",
      url: "https://files.pythonhosted.org/packages/40/1c/b38f71c1b4e859e10568336d8fbb271170150033c3a9d02b3e126b500828/json_repair-0.64.9-py3-none-any.whl",
      sha256: "531c7d429db82731f3c9811157c025599a2ef620823c56d9143bab0b5ad97930",
      license: "MIT"
    },
    {
      name: "jsonschema",
      version: "4.26.0",
      url: "https://files.pythonhosted.org/packages/69/90/f63fb5873511e014207a475e2bb4e8b2e570d655b00ac19a9a0ca0a385ee/jsonschema-4.26.0-py3-none-any.whl",
      sha256: "d489f15263b8d200f8387e64b4c3a75f06629559fb73deb8fdfb525f2dab50ce",
      license: "MIT"
    },
    {
      name: "jsonschema-specifications",
      version: "2025.9.1",
      url: "https://files.pythonhosted.org/packages/41/45/1a4ed80516f02155c51f51e8cedb3c1902296743db0bbc66608a0db2814f/jsonschema_specifications-2025.9.1-py3-none-any.whl",
      sha256: "98802fee3a11ee76ecaca44429fda8a41bff98b00a0f2838151b113f210cc6fe",
      license: "MIT"
    },
    {
      name: "jusText",
      version: "3.0.2",
      url: "https://files.pythonhosted.org/packages/f2/ac/52f4e86d1924a7fc05af3aeb34488570eccc39b4af90530dd6acecdf16b5/justext-3.0.2-py2.py3-none-any.whl",
      sha256: "62b1c562b15c3c6265e121cc070874243a443bfd53060e869393f09d6b6cc9a7",
      license: "The BSD 2-Clause License"
    },
    {
      name: "lark-oapi",
      version: "1.7.5",
      url: "https://files.pythonhosted.org/packages/21/7b/54d1df1f73ac1339b7df051982d386223202add5560a97839cf6326e6adc/lark_oapi-1.7.5-py3-none-any.whl",
      sha256: "ff70fd5cdf436e26d80bf903fdd7a80cbdbd71981b87ce4c2aa49bb95fc96020",
      license: "MIT"
    },
    {
      name: "litellm",
      version: "1.103.10",
      url: "https://files.pythonhosted.org/packages/0a/5b/8e011f2fed0a445b71b24a79cc426e30433e7435b684167c1953202a3a8a/litellm-1.103.10-cp310-abi3-win_amd64.whl",
      sha256: "adbcbb663a9cc96331de0f6ddd60e81d883288b901b7a4f6fbbfeb66edb669cd",
      license: "MIT"
    },
    {
      name: "loguru",
      version: "0.7.3",
      url: "https://files.pythonhosted.org/packages/0c/29/0348de65b8cc732daa3e33e67806420b2ae89bdce2b04af740289c5c6c8c/loguru-0.7.3-py3-none-any.whl",
      sha256: "31a33c10c8e1e10422bfd431aeb5d351c7cf7fa671e3c4df004162264b28220c",
      license: "See bundled dist-info license files"
    },
    {
      name: "lxml",
      version: "6.1.3",
      url: "https://files.pythonhosted.org/packages/3a/5b/6ed903e4e6278a020c8a6f0dbbe78030d041840a6b4a64ea441a1e414077/lxml-6.1.3-cp312-cp312-win_amd64.whl",
      sha256: "3e9a00d1c2c30936f7add097c41afc5da6556c580909104aafd382cac92a855c",
      license: "BSD-3-Clause"
    },
    {
      name: "lxml_html_clean",
      version: "0.4.6",
      url: "https://files.pythonhosted.org/packages/f5/36/4898b5e3951635846ed0e445e042fadf02b7c5e811a9e43da5b3557bc8d2/lxml_html_clean-0.4.6-py3-none-any.whl",
      sha256: "cc037270ba500a65e7235409dcddcae8ef37300f26dea826b61d917bf0236880",
      license: "BSD-3-Clause"
    },
    {
      name: "markdown-it-py",
      version: "4.2.0",
      url: "https://files.pythonhosted.org/packages/b3/81/4da04ced5a082363ecfa159c010d200ecbd959ae410c10c0264a38cac0f5/markdown_it_py-4.2.0-py3-none-any.whl",
      sha256: "9f7ebbcd14fe59494226453aed97c1070d83f8d24b6fc3a3bcf9a38092641c4a",
      license: "See bundled dist-info license files"
    },
    {
      name: "MarkupSafe",
      version: "3.0.4",
      url: "https://files.pythonhosted.org/packages/3f/bf/62495e180b7000aaf30000fff849e933f74264638057176cf46852500adc/markupsafe-3.0.4-cp312-cp312-win_amd64.whl",
      sha256: "11935df9bf455ed0c04eb87bcd720f02b1fe5e02128a9430f23aed6f93336fc7",
      license: "BSD-3-Clause"
    },
    {
      name: "mcp",
      version: "1.30.0",
      url: "https://files.pythonhosted.org/packages/f5/f4/e58bc33317c92a0203664daaf00bf6f41166cc0149e5d6870a03f7cd004a/mcp-1.30.0-py3-none-any.whl",
      sha256: "666edb5009503e1047c9d60346a756f94b261f05cc2625f23d41c728ffc484d0",
      license: "MIT"
    },
    {
      name: "mdurl",
      version: "0.1.2",
      url: "https://files.pythonhosted.org/packages/b3/38/89ba8ad64ae25be8de66a6d463314cf1eb366222074cfda9ee839c56a4b4/mdurl-0.1.2-py3-none-any.whl",
      sha256: "84008a41e51615a49fc9966191ff91509e3c40b939176e643fd50a5c2196b8f8",
      license: "See bundled dist-info license files"
    },
    {
      name: "multidict",
      version: "7.2.1",
      url: "https://files.pythonhosted.org/packages/68/d5/64108a33c21bde81454b5a400d16baa1378a7d01599de64b131c3e3e3114/multidict-7.2.1-cp312-cp312-win_amd64.whl",
      sha256: "781ca5dfc2f1d58e47f52216a0c1c7e1ba91ce8aa235459e20de2d402af77fb3",
      license: "Apache-2.0"
    },
    {
      name: "networkx",
      version: "3.7",
      url: "https://files.pythonhosted.org/packages/7e/cd/fe58041e9011f307c490e3e17dd48cc516448f7c698a3f2d9d9d65d7e6a8/networkx-3.7-py3-none-any.whl",
      sha256: "e3fd2c13a7814cee3746340d8d7f8598a67f16a58bf47fb7f8793fab6efca1b0",
      license: "BSD-3-Clause"
    },
    {
      name: "numpy",
      version: "2.5.4",
      url: "https://files.pythonhosted.org/packages/12/33/fefe62073dc8acfd0f2b9ed7c003af2f50aa61555e113e6db02b8f79f145/numpy-2.5.4-cp312-cp312-win_amd64.whl",
      sha256: "a7b1b6353e36a7e50de2973a38d705c88ee93adcf120673cee7f45a4a3fa223a",
      license: "BSD-3-Clause AND 0BSD AND MIT AND Zlib AND CC0-1.0"
    },
    {
      name: "openai",
      version: "2.54.0",
      url: "https://files.pythonhosted.org/packages/64/a8/bb76c7356de8ad57f59d5ff993d434df0607f07f08bcc9c9a5c275e399c0/openai-2.54.0-py3-none-any.whl",
      sha256: "89089789197ccdb87f173a03145ed1598d00795220c93e96cf712b1cbf5e5f2b",
      license: "Apache-2.0"
    },
    {
      name: "opentelemetry-api",
      version: "1.45.2",
      url: "https://files.pythonhosted.org/packages/a9/2d/610db864d7513158cebb8f36cc88e67e73bd6c7aa1905ef18d89e1281c81/opentelemetry_api-1.45.2-py3-none-any.whl",
      sha256: "2cbd737377e710ee740d261c94e93fa0f08e6d037c18f17513cc0a2d94479a34",
      license: "Apache-2.0"
    },
    {
      name: "opentelemetry-exporter-http-transport",
      version: "0.66b2",
      url: "https://files.pythonhosted.org/packages/a1/b2/c622a101f31c0e6670b82f4264c4e77c161bce415bc6fc158fda0b82e218/opentelemetry_exporter_http_transport-0.66b2-py3-none-any.whl",
      sha256: "fd5f5b490c099acda1cd7b909d5e8981436bf18cc8c6098d302d114c271720e9",
      license: "Apache-2.0"
    },
    {
      name: "opentelemetry-exporter-otlp-common",
      version: "0.66b2",
      url: "https://files.pythonhosted.org/packages/a8/47/b3049e30b339c82e3c7ec1fc692185a5d5a3ba65a94c570bb39b2c0b8424/opentelemetry_exporter_otlp_common-0.66b2-py3-none-any.whl",
      sha256: "ace86efb75489f925f1ef809856ae5f0c7db534e4afdc624530222228b1236a5",
      license: "Apache-2.0"
    },
    {
      name: "opentelemetry-exporter-otlp-proto-common",
      version: "1.45.2",
      url: "https://files.pythonhosted.org/packages/e6/d6/0f30d38120a949aef70528f845bf539f80df62abb4b8e62fdf69c2b6df5a/opentelemetry_exporter_otlp_proto_common-1.45.2-py3-none-any.whl",
      sha256: "af483b24217028892f017096731b794b196b785025d2e6808874720fd0b05a80",
      license: "Apache-2.0"
    },
    {
      name: "opentelemetry-exporter-otlp-proto-grpc",
      version: "1.45.2",
      url: "https://files.pythonhosted.org/packages/e8/48/14301cac3d106e795eef7e89e191489f086b4e5ad26e47c9635a198e95f4/opentelemetry_exporter_otlp_proto_grpc-1.45.2-py3-none-any.whl",
      sha256: "8a48d60835e90536846bd82de487bfbd81bccb5a1b3d0fb82edeea17db07395c",
      license: "Apache-2.0"
    },
    {
      name: "opentelemetry-exporter-otlp-proto-http",
      version: "1.45.2",
      url: "https://files.pythonhosted.org/packages/32/65/f64d7d2450217e2989714e1dee15e19bf79a77a313387abac0cac77bc10e/opentelemetry_exporter_otlp_proto_http-1.45.2-py3-none-any.whl",
      sha256: "6e4d025138829d0ee57946930c2ccad6491ad4d92a958e9c7eea69278fe60cfc",
      license: "Apache-2.0"
    },
    {
      name: "opentelemetry-instrumentation",
      version: "0.66b2",
      url: "https://files.pythonhosted.org/packages/3b/41/014d40e2b08a5d9d9058ed4967ad992657c203ce0c292ded97364ee7b82a/opentelemetry_instrumentation-0.66b2-py3-none-any.whl",
      sha256: "fa9ccfdab147a14af8107d19ef0a7b5015675273c5adced7a1fc38f28b42ec4c",
      license: "Apache-2.0"
    },
    {
      name: "opentelemetry-instrumentation-asyncio",
      version: "0.66b2",
      url: "https://files.pythonhosted.org/packages/13/7c/040b650db668f7df2d21ca731c1542c232e69173eed4faa1cd2f89a3bb7b/opentelemetry_instrumentation_asyncio-0.66b2-py3-none-any.whl",
      sha256: "8bd83268754604b42ac807acfde11a5d00348fed7b550df3140ffa4496a74147",
      license: "Apache-2.0"
    },
    {
      name: "opentelemetry-proto",
      version: "1.45.2",
      url: "https://files.pythonhosted.org/packages/7e/0d/a0b8f2b9efe2ec1abdf639d3696db9b1563ebeb11d91aac08ba7341e9122/opentelemetry_proto-1.45.2-py3-none-any.whl",
      sha256: "03a7ca1b43f89fd5b965d5975902bb2515c0c86e2428b456836e9a6149c6235a",
      license: "Apache-2.0"
    },
    {
      name: "opentelemetry-sdk",
      version: "1.45.2",
      url: "https://files.pythonhosted.org/packages/9f/a5/9a3b793ef48245f2336a16beb2324c2397dbb3f987cd68942f77cca06156/opentelemetry_sdk-1.45.2-py3-none-any.whl",
      sha256: "ff974ea70ee4f1d51e2ec152db37c2b626c7bf82bb3f7d86114fd8704e7199c6",
      license: "Apache-2.0"
    },
    {
      name: "opentelemetry-semantic-conventions",
      version: "0.66b2",
      url: "https://files.pythonhosted.org/packages/67/bd/6bf33ed31521c565931c037e9e81bac47c1acb000e850c6e24220e2a0c00/opentelemetry_semantic_conventions-0.66b2-py3-none-any.whl",
      sha256: "4cbe61e5f9275d57ab31708446e7938ef4291ebbe6a7fca6f7a629c5acae87d8",
      license: "Apache-2.0"
    },
    {
      name: "openviking",
      version: "0.5.5",
      url: "https://files.pythonhosted.org/packages/60/2c/234a1e3cc5cf9061f6ac590fb99f440fb9f98f2440038a074a8707657007/openviking-0.5.5-cp310-abi3-win_amd64.whl",
      sha256: "42b55e84fd5a67d33813a6e3cfed483353751d576fee3ec9f449cca1a412334c",
      license: "AGPL-3.0"
    },
    {
      name: "openviking-sdk",
      version: "0.1.19",
      url: "https://files.pythonhosted.org/packages/57/ce/cb887e45a45c17445c11f1bb3eef5c922a0dd88a2ec3b8dd3924d4751a27/openviking_sdk-0.1.19-py3-none-any.whl",
      sha256: "f16ad8e3fa66bf0dc6d327eb73e8842f702e9684088b4e50ccce8e3db6ae10bc",
      license: "See bundled dist-info license files"
    },
    {
      name: "orjson",
      version: "3.13.0",
      url: "https://files.pythonhosted.org/packages/58/9d/a1ca7321eeafd7d72e174cdc388cc96301f41516d863e7b1f64f0a1735be/orjson-3.13.0-cp312-cp312-win_amd64.whl",
      sha256: "b571236d8393edcd3236e07423f762bfcf571f852aad667a3bce9e7b755e0790",
      license: "MPL-2.0 AND (Apache-2.0 OR MIT)"
    },
    {
      name: "packaging",
      version: "26.3",
      url: "https://files.pythonhosted.org/packages/63/34/ba1c580383c9eada3711951fef0795c80b829a078d72188184bcab9dd527/packaging-26.3-py3-none-any.whl",
      sha256: "d7193f7c8e4e93f444fde0262bf90af30e16fa0ad0ad44cb553c87339b23cd1c",
      license: "Apache-2.0 OR BSD-2-Clause"
    },
    {
      name: "parsel",
      version: "1.12.1",
      url: "https://files.pythonhosted.org/packages/e9/44/2ff782553b581b3d55632eb4f9de1dc792ca99de7e47f69e22af28a9ef2d/parsel-1.12.1-py3-none-any.whl",
      sha256: "cf74e09857329bddc02c13ae239a9b46f410dc5bd1d05361c8c2643a1a5a7149",
      license: "BSD-3-Clause"
    },
    {
      name: "pathspec",
      version: "1.1.1",
      url: "https://files.pythonhosted.org/packages/f1/d9/7fb5aa316bc299258e68c73ba3bddbc499654a07f151cba08f6153988714/pathspec-1.1.1-py3-none-any.whl",
      sha256: "a00ce642f577bf7f473932318056212bc4f8bfdf53128c78bbd5af0b9b20b189",
      license: "See bundled dist-info license files"
    },
    {
      name: "pdfminer.six",
      version: "20260107",
      url: "https://files.pythonhosted.org/packages/20/8b/28c4eaec9d6b036a52cb44720408f26b1a143ca9bce76cc19e8f5de00ab4/pdfminer_six-20260107-py3-none-any.whl",
      sha256: "366585ba97e80dffa8f00cebe303d2f381884d8637af4ce422f1df3ef38111a9",
      license: "MIT"
    },
    {
      name: "pdfplumber",
      version: "0.11.10",
      url: "https://files.pythonhosted.org/packages/a2/9a/07d658e1e7fad860f1c541ab941348125dbdab773be3a0afaf32361866c7/pdfplumber-0.11.10-py3-none-any.whl",
      sha256: "7741ea81bf165b474b153e6789d10d18e06b6ddcf3ec84289c3ef2fed6802580",
      license: "See bundled dist-info license files"
    },
    {
      name: "pillow",
      version: "13.0.0",
      url: "https://files.pythonhosted.org/packages/ff/cd/73a79ecdc822076002eb24b5e1e4a530b0bb5310fcb6d239abbec877110b/pillow-13.0.0-cp312-cp312-win_amd64.whl",
      sha256: "ff3fe9eb621fbb9db4c4be33ab946f6bac5f98ab50ca8d3260503653656c961b",
      license: "MIT-CMU"
    },
    {
      name: "platformdirs",
      version: "4.14.5",
      url: "https://files.pythonhosted.org/packages/7c/ae/ecbbbfd0e4343a6a521d49b3c8656fb4643dee2a4f6eaf941cf3280391a8/platformdirs-4.14.5-py3-none-any.whl",
      sha256: "8e778c6fa421516f4d3369449f8df3b0e1b72c0e0005fe88e3ec772d0a14e750",
      license: "MIT"
    },
    {
      name: "prometheus_client",
      version: "0.26.0",
      url: "https://files.pythonhosted.org/packages/eb/a3/b69efbf4143b5b9859b977770bbbabcc2796b702fa69dc40271e45cd5a56/prometheus_client-0.26.0-py3-none-any.whl",
      sha256: "fa93d06737aa02bacd05794768508bb97d2fbee28cb3bca04eaae92f0ca953d6",
      license: "Apache-2.0 AND BSD-2-Clause"
    },
    {
      name: "propcache",
      version: "0.5.4",
      url: "https://files.pythonhosted.org/packages/58/7b/6e8ef26f6d510a7916064fec68d55fcbfbdf7eb01e377480d66a122152d8/propcache-0.5.4-cp312-cp312-win_amd64.whl",
      sha256: "98914de2c4d7f0f9f4a8c6ea4bf05841f4175796941e3ef7d47eb718f22311fb",
      license: "Apache-2.0"
    },
    {
      name: "Protego",
      version: "0.7.0",
      url: "https://files.pythonhosted.org/packages/c0/20/e4382a85e4cf4746d11746481f83360b990165725dd36ba73d55e029e6a9/protego-0.7.0-py3-none-any.whl",
      sha256: "944638aaee608f6c83fcad442695f3f9381a60be8d5007248f46b00f201fa5fc",
      license: "BSD-3-Clause"
    },
    {
      name: "protobuf",
      version: "7.36.2",
      url: "https://files.pythonhosted.org/packages/8a/55/b77bda4e5e5f5971fb51b07663694690e9afdb9402136c16a522bd621cad/protobuf-7.36.2-cp310-abi3-win_amd64.whl",
      sha256: "a300819d441e078a5608c0d3c709796bb548136058fda017ae51d425b44fd353",
      license: "3-Clause BSD License"
    },
    {
      name: "py",
      version: "1.11.0",
      url: "https://files.pythonhosted.org/packages/f6/f0/10642828a8dfb741e5f3fbaac830550a518a775c7fff6f04a007259b0548/py-1.11.0-py2.py3-none-any.whl",
      sha256: "607c53218732647dff4acdfcd50cb62615cedf612e72d1724fb1a0cc6405b378",
      license: "MIT license"
    },
    {
      name: "pycares",
      version: "5.2.1",
      url: "https://files.pythonhosted.org/packages/ab/df/e96cd7e94a0d04a835e35ce59fff8dca2bf480d7bcd707c8463f64a2cc4c/pycares-5.2.1-cp312-cp312-win_amd64.whl",
      sha256: "10d6ac376b2bf4123fb50356ff08f1b36084885aaf9fcc6bdcd86118f19ac670",
      license: "MIT"
    },
    {
      name: "pycparser",
      version: "3.12",
      url: "https://files.pythonhosted.org/packages/b6/ae/315bbeee126a769cbde43cf4908acb4b40408d8bf8bbf334dd7368d8dadf/pycparser-3.12-py3-none-any.whl",
      sha256: "a076f3f489b39b43ed13563a1dafe42447445bec2e294154ec5c57fcdda4c85e",
      license: "BSD-3-Clause"
    },
    {
      name: "pycryptodome",
      version: "3.24.1",
      url: "https://files.pythonhosted.org/packages/8c/b1/f4b32febb3a88f73744deb4b5c8187e5e5ed5a24fd4ee54d965ccbc569cf/pycryptodome-3.24.1-cp37-abi3-win_amd64.whl",
      sha256: "c00aa444033bac0379413728e92223c7e2f2b5b85fb3e9284fee19239b6ad8a4",
      license: "BSD, Public Domain"
    },
    {
      name: "pydantic",
      version: "2.14.3",
      url: "https://files.pythonhosted.org/packages/72/b8/b864503789ef5c58597d2a7b4adbee62c26440ab1e682581fc6838df8947/pydantic-2.14.3-py3-none-any.whl",
      sha256: "3f7b347782ab7e4cf4c798496ae3a82787d9f21ec12676a9c564355eeef8daa8",
      license: "MIT"
    },
    {
      name: "pydantic-settings",
      version: "2.16.2",
      url: "https://files.pythonhosted.org/packages/39/88/4131c51ff87b7cd7f82a1194d0c0a2b7ca68c72d9da04c3b7e69ab91a79f/pydantic_settings-2.16.2-py3-none-any.whl",
      sha256: "8d523e5c129b097686bde019bd6109bff53f4c8c3f63f1ddf9933ffa42e5ab4f",
      license: "MIT"
    },
    {
      name: "pydantic_core",
      version: "2.50.4",
      url: "https://files.pythonhosted.org/packages/82/88/d438a8fcf3738e9ff2670f724047ca3893ec899bcd5cdfc077a2aab133c6/pydantic_core-2.50.4-cp312-cp312-win_amd64.whl",
      sha256: "ea2f61b0bc12f3592288503961b764579dea0658852d96a0b3d823614d808821",
      license: "MIT"
    },
    {
      name: "PyDispatcher",
      version: "2.0.7",
      url: "https://files.pythonhosted.org/packages/66/0e/9ee7bc0b48ec45d93b302fa2d787830dca4dc454d31a237faa5815995988/PyDispatcher-2.0.7-py3-none-any.whl",
      sha256: "96543bea04115ffde08f851e1d45cacbfd1ee866ac42127d9b476dc5aefa7de0",
      license: "BSD"
    },
    {
      name: "Pygments",
      version: "2.21.0",
      url: "https://files.pythonhosted.org/packages/71/46/17f022dd3e953bf20a04a028a21ec746d942f8d2af30fa0f124fa0e6a684/pygments-2.21.0-py3-none-any.whl",
      sha256: "2363c69b61c4a97c838da3b130dcd6468f4848992b21a82f2a63ec34377137d9",
      license: "BSD-2-Clause"
    },
    {
      name: "PyJWT",
      version: "2.15.1",
      url: "https://files.pythonhosted.org/packages/50/ca/44de4e75f8aadc457f0634be3b542815078ded46dca30efb960edeecad6e/pyjwt-2.15.1-py3-none-any.whl",
      sha256: "42d59d631f7768a1028a64c7ff581a9bf7519804daf91fc5b6c56e30eec5e193",
      license: "MIT"
    },
    {
      name: "pyOpenSSL",
      version: "26.4.0",
      url: "https://files.pythonhosted.org/packages/51/ad/2cf6d3fa2fae5c79e1ed9960c0d42badd0f94d81dd12b50604cdc839e648/pyopenssl-26.4.0-py3-none-any.whl",
      sha256: "f0eb0cb2d581d3ad2b9c489468485e7f2ab6727d08401bcf9d824c3caddf3c1c",
      license: "Apache License, Version 2.0"
    },
    {
      name: "pypdfium2",
      version: "5.15.2",
      url: "https://files.pythonhosted.org/packages/fe/7f/8aa446529fa14523e5c18f89e823afc95526689f76a75efe68a82a10d850/pypdfium2-5.15.2-py3-none-win_amd64.whl",
      sha256: "74d1bace34fb01c660d0b64344d5a4b7d276942b7c6623c88ab59ea21c5acfbd",
      license: "BSD-3-Clause, Apache-2.0, dependency licenses"
    },
    {
      name: "python-dateutil",
      version: "2.9.0.post0",
      url: "https://files.pythonhosted.org/packages/ec/57/56b9bcc3c9c6a792fcbaf139543cee77261f3651ca9da0c93f5c1221264b/python_dateutil-2.9.0.post0-py2.py3-none-any.whl",
      sha256: "a8b2bc7bffae282281c8140a97d3aa9c14da0b136dfe83f850eea9a5f7470427",
      license: "Dual License"
    },
    {
      name: "python-dotenv",
      version: "1.2.4",
      url: "https://files.pythonhosted.org/packages/60/d1/38f3a3405989a89ac18390803e70c6ad7c7760da4f9b83cbeca0c44a0c72/python_dotenv-1.2.4-py3-none-any.whl",
      sha256: "42269a8a5b3fd54ffa6f3d84b18abed50064717576b4ecf03dc4a55d8aa04fdc",
      license: "BSD-3-Clause"
    },
    {
      name: "python-multipart",
      version: "0.0.33",
      url: "https://files.pythonhosted.org/packages/dd/1b/6b1b4164ec734cac911460ab599bfbe46afedd42c5c9627fe4235942c314/python_multipart-0.0.33-py3-none-any.whl",
      sha256: "8f16c07b36add9da6b2ee87d3efcaf0a45a6de9c3d0a5dd94e9ccf7675a7bc45",
      license: "Apache-2.0"
    },
    {
      name: "pytz",
      version: "2026.6",
      url: "https://files.pythonhosted.org/packages/b6/25/564f3fc5b70c1398d706c51f2b1470d0ea0b1b2f96fee67877b6f5bdf3b6/pytz-2026.6-py2.py3-none-any.whl",
      sha256: "7fed3fee8fd6bd4a2b7b75a8d56021d0624127bf69bd5691f115db929ac570b3",
      license: "MIT"
    },
    {
      name: "pywin32",
      version: "312",
      url: "https://files.pythonhosted.org/packages/03/d9/77040d3b43df3f3be32ea289433d660d2727f5ba327bc73be835127d9d60/pywin32-312-cp312-cp312-win_amd64.whl",
      sha256: "b457f6d628a47e8a7346ce22acb7e1a46a4a78b52e1d17e1af56871bd19a93bc",
      license: "PSF"
    },
    {
      name: "PyYAML",
      version: "6.0.3",
      url: "https://files.pythonhosted.org/packages/86/bf/899e81e4cce32febab4fb42bb97dcdf66bc135272882d1987881a4b519e9/pyyaml-6.0.3-cp312-cp312-win_amd64.whl",
      sha256: "5fcd34e47f6e0b794d17de1b4ff496c00986e1c83f7ab2fb8fcfe9616ff7477b",
      license: "MIT"
    },
    {
      name: "queuelib",
      version: "1.10.0",
      url: "https://files.pythonhosted.org/packages/bc/78/715c431c72ab296e1d4540e9dbbbc78f086bed3cdb04fc68fb32c6232d0b/queuelib-1.10.0-py3-none-any.whl",
      sha256: "257936b7202d12325c80ad79e254c59e2cd3533704ae6dffb567b1a0b309ae5e",
      license: "BSD-3-Clause"
    },
    {
      name: "RapidFuzz",
      version: "3.14.6",
      url: "https://files.pythonhosted.org/packages/84/c4/12f01df5778227c8655fcd9b429fc001d43270f5d8d154edc9066bab1de3/rapidfuzz-3.14.6-cp312-cp312-win_amd64.whl",
      sha256: "cfca36e4612208875e08611a779164b6cb8900ab8bbd3d82d4cfdfae9efbfac9",
      license: "MIT"
    },
    {
      name: "readerwriterlock",
      version: "1.0.10",
      url: "https://files.pythonhosted.org/packages/62/9c/d496912967d3c8d498e962f61a93bffc9304a0f09fd8e632a90a0b375d37/readerwriterlock-1.0.10-py3-none-any.whl",
      sha256: "788c28ca2da19681e466609774252eb55a963286c6f7cf8ace13d0be21a69683",
      license: "MIT"
    },
    {
      name: "referencing",
      version: "0.37.0",
      url: "https://files.pythonhosted.org/packages/2c/58/ca301544e1fa93ed4f80d724bf5b194f6e4b945841c5bfd555878eea9fcb/referencing-0.37.0-py3-none-any.whl",
      sha256: "381329a9f99628c9069361716891d34ad94af76e461dcb0335825aecc7692231",
      license: "MIT"
    },
    {
      name: "regex",
      version: "2026.11.9",
      url: "https://files.pythonhosted.org/packages/c1/ef/e03271355a802f38f7510e31e006667fc8b95b771058d75a36e2afda61b2/regex-2026.11.9-cp312-cp312-win_amd64.whl",
      sha256: "ae42ad9825cde4cd374abfce6bc82233b91099170c138b349554813e97da5100",
      license: "Apache-2.0 AND CNRI-Python"
    },
    {
      name: "requests",
      version: "2.34.2",
      url: "https://files.pythonhosted.org/packages/a0/f4/c67b0b3f1b9245e8d266f0f112c500d50e5b4e83cb6f3b71b6528104182a/requests-2.34.2-py3-none-any.whl",
      sha256: "2a0d60c172f83ac6ab31e4554906c0f3b3588d37b5cb939b1c061f4907e278e0",
      license: "Apache-2.0"
    },
    {
      name: "requests-file",
      version: "3.0.1",
      url: "https://files.pythonhosted.org/packages/e1/d5/de8f089119205a09da657ed4784c584ede8381a0ce6821212a6d4ca47054/requests_file-3.0.1-py2.py3-none-any.whl",
      sha256: "d0f5eb94353986d998f80ac63c7f146a307728be051d4d1cd390dbdb59c10fa2",
      license: "Apache 2.0"
    },
    {
      name: "requests-toolbelt",
      version: "1.0.0",
      url: "https://files.pythonhosted.org/packages/3f/51/d4db610ef29373b879047326cbf6fa98b6c1969d6f6dc423279de2b1be2c/requests_toolbelt-1.0.0-py2.py3-none-any.whl",
      sha256: "cccfdd665f0a24fcf4726e690f65639d272bb0637b9b92dfd91a5568ccf6bd06",
      license: "Apache 2.0"
    },
    {
      name: "retry",
      version: "0.9.2",
      url: "https://files.pythonhosted.org/packages/4b/0d/53aea75710af4528a25ed6837d71d117602b01946b307a3912cb3cfcbcba/retry-0.9.2-py2.py3-none-any.whl",
      sha256: "ccddf89761fa2c726ab29391837d4327f819ea14d244c232a1d24c67a2f98606",
      license: "Apache License 2.0"
    },
    {
      name: "rich",
      version: "15.0.0",
      url: "https://files.pythonhosted.org/packages/82/3b/64d4899d73f91ba49a8c18a8ff3f0ea8f1c1d75481760df8c68ef5235bf5/rich-15.0.0-py3-none-any.whl",
      sha256: "33bd4ef74232fb73fe9279a257718407f169c09b78a87ad3d296f548e27de0bb",
      license: "MIT"
    },
    {
      name: "rpds-py",
      version: "2026.9.1",
      url: "https://files.pythonhosted.org/packages/1c/84/1700cc748d0eaa747486e4e82882d2575224e6e9a3148df583058850c629/rpds_py-2026.9.1-cp312-cp312-win_amd64.whl",
      sha256: "5ce8943f79c2210f7abcc28e86367b03b28d95027fd01c46d2472373ae70c86f",
      license: "MIT"
    },
    {
      name: "s3transfer",
      version: "0.19.3",
      url: "https://files.pythonhosted.org/packages/e2/a4/88f9e10498759121060b8050a1554753dfc04df39bbbcc7aad9ecc8d9440/s3transfer-0.19.3-py3-none-any.whl",
      sha256: "24eb7535804306355e31c952a90022bf5b2f9d760f9a11062c7493a217c08553",
      license: "Apache License 2.0"
    },
    {
      name: "Scrapy",
      version: "2.20.0",
      url: "https://files.pythonhosted.org/packages/29/36/aaa956ac44a4920ed0410d7300bab48c6e04f17690c3c3f9e0f1edd425e2/scrapy-2.20.0-py3-none-any.whl",
      sha256: "e425ff161422de4916206cef4381ac31a5df50c47fab39ad16d9c7551597dd47",
      license: "BSD-3-Clause"
    },
    {
      name: "service-identity",
      version: "26.1.0",
      url: "https://files.pythonhosted.org/packages/93/eb/2433e1af4ff903499144de4846569fb3300b816179ae99a03c2f011b666a/service_identity-26.1.0-py3-none-any.whl",
      sha256: "68c32dadbb69135fb951077677e07cd7f6031020f3a8c8f47a28cda8a0742118",
      license: "MIT"
    },
    {
      name: "shellingham",
      version: "1.5.4",
      url: "https://files.pythonhosted.org/packages/e0/f9/0595336914c5619e5f28a1fb793285925a8cd4b432c9da0a987836c7f822/shellingham-1.5.4-py2.py3-none-any.whl",
      sha256: "7ecfff8f2fd72616f7481040475a65b2bf8af90a56c89140852d1120324e8686",
      license: "ISC License"
    },
    {
      name: "six",
      version: "1.17.0",
      url: "https://files.pythonhosted.org/packages/b7/ce/149a00dd41f10bc29e5921b496af8b574d8413afcd5e30dfa0ed46c2cc5e/six-1.17.0-py2.py3-none-any.whl",
      sha256: "4721f391ed90541fddacab5acf947aa0d3dc7d27b2e1e8eda2be8970586c3274",
      license: "MIT"
    },
    {
      name: "sniffio",
      version: "1.3.1",
      url: "https://files.pythonhosted.org/packages/e9/44/75a9c9421471a6c4805dbf2356f7c181a29c1879239abab1ea2cc8f38b40/sniffio-1.3.1-py3-none-any.whl",
      sha256: "2f6da418d1f1e0fddd844478f41680e794e6051915791a034ff65e5f100525a2",
      license: "MIT OR Apache-2.0"
    },
    {
      name: "soupsieve",
      version: "4.1",
      url: "https://files.pythonhosted.org/packages/88/73/6a2087c72975cfc07394623bca8d17654342ea4055ae368deafe5a81a542/soupsieve-4.1-py3-none-any.whl",
      sha256: "e4d667b3974ce6e038e7390486b8093369854a1d345ffdd4c121dfc4a782e809",
      license: "MIT"
    },
    {
      name: "sse-starlette",
      version: "3.7.0",
      url: "https://files.pythonhosted.org/packages/6a/11/25cabac0a24fa76f58637d8671b549c90d818d69d26beecf0c59a3b186e0/sse_starlette-3.7.0-py3-none-any.whl",
      sha256: "f1d3136caa12d129284fca3d2ded79bc9af943320b6472712955fea52a6d3eea",
      license: "BSD-3-Clause"
    },
    {
      name: "starlette",
      version: "1.10.0",
      url: "https://files.pythonhosted.org/packages/88/2e/947cfe02def9371c07cd5bf5b6b61c829e9aecb9904db02a66cfafbc1eec/starlette-1.10.0-py3-none-any.whl",
      sha256: "478c0ab3b4ced6e82719849c118fa406f0278a3499c1a898cd15cd31bdc38ce4",
      license: "BSD-3-Clause"
    },
    {
      name: "tabulate",
      version: "0.10.0",
      url: "https://files.pythonhosted.org/packages/99/55/db07de81b5c630da5cbf5c7df646580ca26dfaefa593667fc6f2fe016d2e/tabulate-0.10.0-py3-none-any.whl",
      sha256: "f0b0622e567335c8fabaaa659f1b33bcb6ddfe2e496071b743aa113f8774f2d3",
      license: "MIT"
    },
    {
      name: "tenacity",
      version: "9.2.1",
      url: "https://files.pythonhosted.org/packages/d6/26/1ff2b0721ac66a3ec5b1402b333110b352ab0a8724052ac279a7b82d40c4/tenacity-9.2.1-py3-none-any.whl",
      sha256: "9e56f17539296baab7beabb08b92f6ee3d7be92d8be72d763360677c2ad6580e",
      license: "Apache-2.0"
    },
    {
      name: "tiktoken",
      version: "0.14.0",
      url: "https://files.pythonhosted.org/packages/bd/bd/a2e884fb1402cba5be08836590320012b2d8ada0e2eef9911a64df4bcd2d/tiktoken-0.14.0-cp312-cp312-win_amd64.whl",
      sha256: "087538c080e5ff421abd3a0785ed63c5111d06af98e6cd0d374dbe5969147ca3",
      license: 'MIT License\n\nCopyright (c) 2022 OpenAI, Shantanu Jain\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n'
    },
    {
      name: "tinycss2",
      version: "1.5.1",
      url: "https://files.pythonhosted.org/packages/60/45/c7b5c3168458db837e8ceab06dc77824e18202679d0463f0e8f002143a97/tinycss2-1.5.1-py3-none-any.whl",
      sha256: "3415ba0f5839c062696996998176c4a3751d18b7edaaeeb658c9ce21ec150661",
      license: "See bundled dist-info license files"
    },
    {
      name: "tld",
      version: "0.13.2",
      url: "https://files.pythonhosted.org/packages/9e/90/39a85a4b63c84213e78b3c17d22e1bf45328acf8ebb33ef93be30d0a3911/tld-0.13.2-py2.py3-none-any.whl",
      sha256: "9b8fdbdb880e7ba65b216a4937f2c94c49a7226723783d5838fc958ac76f4e0c",
      license: "MPL-1.1 OR GPL-2.0-only OR LGPL-2.1-or-later"
    },
    {
      name: "tldextract",
      version: "5.4.0",
      url: "https://files.pythonhosted.org/packages/b8/e0/d5760e222a7e3f3aec7ef59f6dff952af27d09ec168bcca50751d9698151/tldextract-5.4.0-py3-none-any.whl",
      sha256: "7f02aed30bd3b6ad5717192eb859a39b20aafc7caf3917d9cf6cb00a58efb34f",
      license: "BSD-3-Clause"
    },
    {
      name: "tokenizers",
      version: "0.23.3",
      url: "https://files.pythonhosted.org/packages/d1/6c/24f074c9a0efb98e61b20aafe6b2641922d5db24e447d5d6daffd9e17555/tokenizers-0.23.3-cp310-abi3-win_amd64.whl",
      sha256: "1f0823bb00c5fdc98e487354d54dd55a03848d61a1a0bf29a68c77f24f3b26c3",
      license: "See bundled dist-info license files"
    },
    {
      name: "tqdm",
      version: "4.70.1",
      url: "https://files.pythonhosted.org/packages/a7/03/921a3d3c75785aca9ebfbfcabfbc3a1be12e2ab5265deb026d55a5a3f83e/tqdm-4.70.1-py3-none-any.whl",
      sha256: "c293e525e6fef9c20e8728fd4612df02a0aa31bb5fe91ecd93e123b1b7bffa73",
      license: "MPL-2.0 AND MIT"
    },
    {
      name: "trafilatura",
      version: "2.3.1",
      url: "https://files.pythonhosted.org/packages/f5/20/e95d135c417aceaa3d34d1b4dff9aceb85e98800480eca1b033933717169/trafilatura-2.3.1-py3-none-any.whl",
      sha256: "f86bad2ee36f82884e14dee84c83aae0f0ac0127da5c65764e82f3846716b822",
      license: "Apache-2.0"
    },
    {
      name: "tree-sitter",
      version: "0.25.2",
      url: "https://files.pythonhosted.org/packages/46/f2/5f654994f36d10c64d50a192239599fcae46677491c8dd53e7579c35a3e3/tree_sitter-0.25.2-cp312-cp312-win_amd64.whl",
      sha256: "6d0302550bbe4620a5dc7649517c4409d74ef18558276ce758419cf09e578897",
      license: "See bundled dist-info license files"
    },
    {
      name: "tree-sitter-bash",
      version: "0.25.1",
      url: "https://files.pythonhosted.org/packages/71/0f/203fe6b27211387f4b9ba8c4a321567ca4ded2624dae6ccdbd2b6e940e17/tree_sitter_bash-0.25.1-cp310-abi3-win_amd64.whl",
      sha256: "52a6802d9218f86278aa3e8b459c3abdad67eed0fde1f9f13aca5b6c634217a6",
      license: "MIT"
    },
    {
      name: "tree-sitter-c",
      version: "0.24.2",
      url: "https://files.pythonhosted.org/packages/c1/f7/72a1d6b42dd31fd37e03ff67e7dc5ee572301499e6b216002b8dd42a1714/tree_sitter_c-0.24.2-cp310-abi3-win_amd64.whl",
      sha256: "abb549225091f7b25df2dd3a0143ece6e208f7055d8bcb4700b41ee79b9ef1e1",
      license: "MIT"
    },
    {
      name: "tree-sitter-c-sharp",
      version: "0.23.1",
      url: "https://files.pythonhosted.org/packages/6a/2c/f742d60f818cba83760f4975c7158d1c96c36b5807e95a843db7fb8c64b7/tree_sitter_c_sharp-0.23.1-cp310-abi3-win_amd64.whl",
      sha256: "d4486653feaff3314ef45534dcb6f9ea8ab3aa160896287c6473788f88eb38be",
      license: "MIT"
    },
    {
      name: "tree-sitter-cpp",
      version: "0.23.4",
      url: "https://files.pythonhosted.org/packages/37/7e/909e52b3dec09c475140b0e175511e275d0d00ba2dbd7c68102d377ae0f6/tree_sitter_cpp-0.23.4-cp39-abi3-win_amd64.whl",
      sha256: "68606a45bea92669d155399e1239f771a7767d8683cd8f8e30e7d813107030ca",
      license: "MIT"
    },
    {
      name: "tree-sitter-elixir",
      version: "0.3.5",
      url: "https://files.pythonhosted.org/packages/c6/a5/634b505a4c349becc753c1faef5350f32ca027297c16a45fb0942967db2a/tree_sitter_elixir-0.3.5-cp39-abi3-win_amd64.whl",
      sha256: "c0b5df229405d42ba5c94254d92e414b1f200be8422561d243ae5b3558e84f76",
      license: "Apache-2.0"
    },
    {
      name: "tree-sitter-fortran",
      version: "0.6.0",
      url: "https://files.pythonhosted.org/packages/9d/eb/a52219602f674fd5acf4df7e2ce940b86e0d2a73409c42b136efc171d867/tree_sitter_fortran-0.6.0-cp39-abi3-win_amd64.whl",
      sha256: "cccd5bce1cdebcf34d3a130ecf4944bc409ddc93096317e3249838ffdaf927eb",
      license: "MIT"
    },
    {
      name: "tree-sitter-go",
      version: "0.25.0",
      url: "https://files.pythonhosted.org/packages/6e/b6/d9142583374720e79aca9ccb394b3795149a54c012e1dfd80738df2d984e/tree_sitter_go-0.25.0-cp310-abi3-win_amd64.whl",
      sha256: "30d4ada57a223dfc2c32d942f44d284d40f3d1215ddcf108f96807fd36d53022",
      license: "MIT"
    },
    {
      name: "tree-sitter-groovy",
      version: "0.1.2",
      url: "https://files.pythonhosted.org/packages/7a/2d/7e8fd76d9c1993c4b4f85a75e87698d85e845068d65972c9bf0458cb2dd5/tree_sitter_groovy-0.1.2-cp39-abi3-win_amd64.whl",
      sha256: "bb8b20e2c92a18509ad3b830aeba9f5754778903e7dfd6999c3efb3c79c43d76",
      license: "MIT"
    },
    {
      name: "tree-sitter-java",
      version: "0.23.5",
      url: "https://files.pythonhosted.org/packages/da/d6/0528c7e1e88a18221dbd8ccee3825bf274b1fa300f745fd74eb343878043/tree_sitter_java-0.23.5-cp39-abi3-win_amd64.whl",
      sha256: "1ee45e790f8d31d416bc84a09dac2e2c6bc343e89b8a2e1d550513498eedfde7",
      license: "MIT"
    },
    {
      name: "tree-sitter-javascript",
      version: "0.25.0",
      url: "https://files.pythonhosted.org/packages/3b/dc/d90cb1790f8cec9b4878d278ad9faf7c8f893189ce0f855304fd704fc274/tree_sitter_javascript-0.25.0-cp310-abi3-win_amd64.whl",
      sha256: "e5ed840f5bd4a3f0272e441d19429b26eedc257abe5574c8546da6b556865e3c",
      license: "MIT"
    },
    {
      name: "tree-sitter-json",
      version: "0.24.8",
      url: "https://files.pythonhosted.org/packages/53/df/31daab1eedb445bef208a04fc35428de3afe2b37075fec84d7737e1c69de/tree_sitter_json-0.24.8-cp39-abi3-win_amd64.whl",
      sha256: "e4849a03cd7197267b2688a4506a90a13568a8e0e8588080bd0212fcb38974e3",
      license: "MIT"
    },
    {
      name: "tree-sitter-julia",
      version: "0.23.1",
      url: "https://files.pythonhosted.org/packages/b8/00/931594dfe150b0aa77035d984bae5a0c433ccc03e36b91d95598b77ba601/tree_sitter_julia-0.23.1-cp39-abi3-win_amd64.whl",
      sha256: "13031aa4c9ac7d0665aa3ecd9fbc6f9c6afd601c68f6ae67a8eeaca01465aeed",
      license: "MIT"
    },
    {
      name: "tree-sitter-kotlin",
      version: "1.1.0",
      url: "https://files.pythonhosted.org/packages/24/c9/5cca0a44db41224f7f10992450af17ff432c1a336852efb312246d5705e5/tree_sitter_kotlin-1.1.0-cp39-abi3-win_amd64.whl",
      sha256: "d4d3f330f515ba8b91da04a5335eb9ff3ce071c7b7855958912f2560f6e14976",
      license: "MIT"
    },
    {
      name: "tree-sitter-language-pack",
      version: "1.13.3",
      url: "https://files.pythonhosted.org/packages/5b/32/5a395972eee620b763493f6abf527dd76dea0cef91010ab348137cb51a2d/tree_sitter_language_pack-1.13.3-cp310-abi3-win_amd64.whl",
      sha256: "c67c322370c30fa802e01532933709d0c29de8337d911eb693692a996993e55d",
      license: "MIT"
    },
    {
      name: "tree-sitter-lua",
      version: "0.5.0",
      url: "https://files.pythonhosted.org/packages/25/20/8973f4049d81b2920ef496cf61b9b947ccee63dfb1aa89cb73810cb22784/tree_sitter_lua-0.5.0-cp310-abi3-win_amd64.whl",
      sha256: "ace3dd61218124ee08410a55601cb5fbbb00be3ee004b30e705cef9ef25165a9",
      license: "MIT"
    },
    {
      name: "tree-sitter-objc",
      version: "3.0.2",
      url: "https://files.pythonhosted.org/packages/93/0a/1653cd34758bd5436980ad8e68e2893f323a487afef4a6504bbfc654b1cc/tree_sitter_objc-3.0.2-cp39-abi3-win_amd64.whl",
      sha256: "f3c93e991a86e96b8996cc735a4b31b38c65820913bf5a96904d07a51a8d9423",
      license: "MIT"
    },
    {
      name: "tree-sitter-php",
      version: "0.24.1",
      url: "https://files.pythonhosted.org/packages/4e/c4/6c690c33b1ae9cae9505c0a2896f046fda174d72c46bdafce6aab3b2f2e7/tree_sitter_php-0.24.1-cp310-abi3-win_amd64.whl",
      sha256: "1a1b65b72a8410d421f914ee13d38fd546a94d01cb834f69b27c78ba7589a5b5",
      license: "MIT"
    },
    {
      name: "tree-sitter-powershell",
      version: "0.26.4",
      url: "https://files.pythonhosted.org/packages/6a/0e/48df1017fda824627a7508080a8a9ef654b4ffc85e55f50185eae419ca0f/tree_sitter_powershell-0.26.4-cp310-abi3-win_amd64.whl",
      sha256: "702eadf70ec8b1fd0bbf9b4169ed58f0ee0bcab333e5103e97c0f562be299088",
      license: "MIT"
    },
    {
      name: "tree-sitter-python",
      version: "0.25.0",
      url: "https://files.pythonhosted.org/packages/ed/a2/996fc2dfa1076dc460d3e2f3c75974ea4b8f02f6bc925383aaae519920e8/tree_sitter_python-0.25.0-cp310-abi3-win_amd64.whl",
      sha256: "9bcde33f18792de54ee579b00e1b4fe186b7926825444766f849bf7181793a76",
      license: "MIT"
    },
    {
      name: "tree-sitter-ruby",
      version: "0.23.1",
      url: "https://files.pythonhosted.org/packages/dd/4a/f5bcca350b84cdf75a53e918b8efa06c46ed650d99d3ef22195e9d8020cc/tree_sitter_ruby-0.23.1-cp39-abi3-win_amd64.whl",
      sha256: "02e2c19ebefe29226c14aa63e11e291d990f5b5c20a99940ab6e7eda44e744e5",
      license: "MIT"
    },
    {
      name: "tree-sitter-rust",
      version: "0.24.0",
      url: "https://files.pythonhosted.org/packages/b9/df/a6321043d6dee313e5fa3b6a13384119d590393368134cf12f2ee7f9e664/tree_sitter_rust-0.24.0-cp39-abi3-win_amd64.whl",
      sha256: "2e29be0292eaf1f99389b3af4281f92187612af31ba129e90f4755f762993441",
      license: "MIT"
    },
    {
      name: "tree-sitter-scala",
      version: "0.26.9",
      url: "https://files.pythonhosted.org/packages/f9/ec/0de04c5d5ac2aeef743ff9480afad3a61778838d51e1a33a374b05caced2/tree_sitter_scala-0.26.9-cp39-abi3-win_amd64.whl",
      sha256: "24d72c29eed21ac8ef1b47950673e43c24ef9bf307669152ede85c5b8ed0c502",
      license: "MIT"
    },
    {
      name: "tree-sitter-swift",
      version: "0.7.4",
      url: "https://files.pythonhosted.org/packages/22/9f/cdc6712032be81a590f275603936a325943424824fab6956bf7e3382f20a/tree_sitter_swift-0.7.4-cp38-abi3-win_amd64.whl",
      sha256: "6edfdeff86d842e7ee54f2a5d77dad9b6d9cc8b9f1ae0342e1c4349c44348803",
      license: "MIT"
    },
    {
      name: "tree-sitter-typescript",
      version: "0.23.2",
      url: "https://files.pythonhosted.org/packages/8b/ab/dd84f0e2337296a5f09749f7b5483215d75c8fa9e33738522e5ed81f7254/tree_sitter_typescript-0.23.2-cp39-abi3-win_amd64.whl",
      sha256: "3f730b66396bc3e11811e4465c41ee45d9e9edd6de355a58bbbc49fa770da8f9",
      license: "MIT"
    },
    {
      name: "tree-sitter-verilog",
      version: "1.0.3",
      url: "https://files.pythonhosted.org/packages/ba/0d/c0cc641f75e64c9d2afa8c71bba74de42365a35fe7ee07217fcb5cc5b640/tree_sitter_verilog-1.0.3-cp39-abi3-win_amd64.whl",
      sha256: "da82da153a8d515941da26d84d51b6b79d0fe42d0a0de19845562c3b1dd091c1",
      license: "MIT"
    },
    {
      name: "tree-sitter-zig",
      version: "1.1.2",
      url: "https://files.pythonhosted.org/packages/ab/5c/f5fb2ce355bbd381e647b04e8b2078a4043e663b6df6145d87550d3c3fe5/tree_sitter_zig-1.1.2-cp39-abi3-win_amd64.whl",
      sha256: "7b94f00a0e69231ac4ebf0aa763734b9b5637e0ff13634ebfe6d13fadece71e9",
      license: "MIT"
    },
    {
      name: "truststore",
      version: "0.10.5",
      url: "https://files.pythonhosted.org/packages/51/e9/3a7820be2bb0fe53b6bc9c3be26d3d1158004e4c3ab953aa6840b955b1e9/truststore-0.10.5-py3-none-any.whl",
      sha256: "9aaaedaefaf06d8b206278cf8b5012bc897f485a874503501e12d776df78951c",
      license: "MIT"
    },
    {
      name: "Twisted",
      version: "26.10.0",
      url: "https://files.pythonhosted.org/packages/10/93/fdfa79229fdc19a6542086d46b5c5d424ee62a6408d25657e8690e0a745f/twisted-26.10.0-py3-none-any.whl",
      sha256: "3732f42af218925a0fe78d6668db55853f7fb532245a89a2669babe7d3000fa8",
      license: "MIT"
    },
    {
      name: "typer",
      version: "0.29.0",
      url: "https://files.pythonhosted.org/packages/c1/3d/cc08d3cb257764101c71c47f18e2f547782d013928edc877f155cb99229d/typer-0.29.0-py3-none-any.whl",
      sha256: "b3c3de6e06a848274dc7bd56a433499e9cf25fa1d40aa3ba4eccfec4e1624c7b",
      license: "MIT"
    },
    {
      name: "typing-inspection",
      version: "0.4.5",
      url: "https://files.pythonhosted.org/packages/de/0c/ea2544850a7c135e15033a5c7a8e7211136184b7ae63e2239d557c2b3019/typing_inspection-0.4.5-py3-none-any.whl",
      sha256: "bc210535442b39e1bf2805e0c7a17dfd6a4ace760c84c7f7d16245d23a6b1c39",
      license: "MIT"
    },
    {
      name: "typing_extensions",
      version: "4.16.0",
      url: "https://files.pythonhosted.org/packages/49/d3/b8441a820a491ddfc024b0b0cf0393375b75ea13866d9c66727e54c2fc80/typing_extensions-4.16.0-py3-none-any.whl",
      sha256: "481caa481374e813c1b176ada14e97f1f67a4539ce9cfeb3f350d78d6370c2e8",
      license: "PSF-2.0"
    },
    {
      name: "tzdata",
      version: "2026.6",
      url: "https://files.pythonhosted.org/packages/0a/66/9a06c2227fedfd4919f0eaaa8b94377d9730882a7e4f95823c9a331ab5e1/tzdata-2026.6-py2.py3-none-any.whl",
      sha256: "0a10eec6e13ef16b627fabed9a5f2ba61a62b1c67f327305f4e7e412a70b4aec",
      license: "Apache-2.0"
    },
    {
      name: "tzlocal",
      version: "5.4.5",
      url: "https://files.pythonhosted.org/packages/7b/c1/9be4e1a8a30db8729a86628073910e56f85aaf8a659e053f376a2e6ea5a8/tzlocal-5.4.5-py3-none-any.whl",
      sha256: "ecab534f6d65d9deb4c4ea52c121ab6dd5958e9b878e71dcb102578269752454",
      license: "MIT"
    },
    {
      name: "urllib3",
      version: "2.8.0",
      url: "https://files.pythonhosted.org/packages/92/9d/c4e665119135114480843e7ab388fa94d8480650450e6f8e26b70d323a4c/urllib3-2.8.0-py3-none-any.whl",
      sha256: "0cf3cae568d36aa9576b28dfb35f11328f1cb974ca7647d9475ebb86c75ac6e3",
      license: "MIT"
    },
    {
      name: "uvicorn",
      version: "0.54.0",
      url: "https://files.pythonhosted.org/packages/38/0c/b54a4fdd7f90a3af8b02ebc9ce6712c2c208b7926a2f7bad95c33ebbe943/uvicorn-0.54.0-py3-none-any.whl",
      sha256: "505bdb0f318731d45f1f712071fc781a8981f6847a31c902c9f5e652d4f67faf",
      license: "BSD-3-Clause"
    },
    {
      name: "volcengine",
      version: "1.0.229",
      url: "https://files.pythonhosted.org/packages/00/eb/7585c6440e810d00c8aada0e72fd8feb407f0ef962d393c17ffeb7adda4a/volcengine-1.0.229-py3-none-any.whl",
      sha256: "dc7372657d4ce786157fe0afe89ddc02039dfb320567efe2dfdf60c3e9b85eb6",
      license: "MIT License"
    },
    {
      name: "volcengine-ark-runtime",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/c8/55/a4b484647c1cfe353558df4ab30cbef3b23e6aaefaeae67d67e5883f6231/volcengine_ark_runtime-5.0.57-py3-none-any.whl",
      sha256: "18a62ec4efccb10615190f54fc64700d72428b72148e4ce3236fba60ea5d47a8",
      license: "Apache License 2.0"
    },
    {
      name: "volcengine-python-sdk",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/a3/de/63d29b4de317c162e6997c509c452eeb9c405f46be42e74944e9983bf67f/volcengine_python_sdk-5.0.57-py2.py3-none-any.whl",
      sha256: "668bf65ee081ffc7084a4e9b0de92e68bb841f7d40612d892f5deef85e28e828",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-acep",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/0f/2c/3f7f38c7e3624d383b05d0739d1a1d1bbcaaded6e6a074b215931f4b2902/volcenginesdk_acep-5.0.57-py2.py3-none-any.whl",
      sha256: "12aaa3d8ce53083dd80ba824b64292d64a845c9579b3eee9989c3fa04c64cb2f",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-advdefence",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/9d/a1/c975f88fe899d312c859c0ae6c0321c6b776615707d088d83a907c746065/volcenginesdk_advdefence-5.0.57-py2.py3-none-any.whl",
      sha256: "2e10a74e2a322c9e5dd65fb0f0ce499ab15852311ae2c840f2ea544e61eb7bf7",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-advdefence20230308",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/ba/fb/51beb132292fa0303f0f39d9c658a5603cb219e1cbaee9c65469cd366e4f/volcenginesdk_advdefence20230308-5.0.57-py2.py3-none-any.whl",
      sha256: "ca0d2bc8f632a6bc7862a692f3e66291968160e1b0e9e3dc2cf3065f8f173d7c",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-aidap",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/79/18/815ca3c71f4a452951d48c333e896cb504bfdf30261497bb53a003a0a54b/volcenginesdk_aidap-5.0.57-py2.py3-none-any.whl",
      sha256: "218e30a6e7d1e1140994a3e2855f0bf799d30e5a64daba53ab6c494ff2894c3e",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-aiotvideo",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/78/9d/ffdd6d2bf80a5620e837481f8513e44262765f4956f3a068f8fcaee4f411/volcenginesdk_aiotvideo-5.0.57-py2.py3-none-any.whl",
      sha256: "432e404ebabb601f3f5dea503f943d4a0e460b65f61bddc0d31c7be2d9d3d26f",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-aiotvideo20231001",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/7e/c1/a3d637c7d621c1121fe43b0c7905b30318fde3d44215a6d9b1b1c3a1598f/volcenginesdk_aiotvideo20231001-5.0.57-py2.py3-none-any.whl",
      sha256: "e4b0cce9ca9d7e5a205c5b64b168e8b8f816fcc1aff9e400e386b954fee5a6a2",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-alb",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/f6/c3/185ec98cc09d2f1bdc12e31ee989d591e0ce6e671cf5ebdd8a52ed2f1c93/volcenginesdk_alb-5.0.57-py2.py3-none-any.whl",
      sha256: "fe038a60704f5d36ca40d0c6520444de4f8c6eebfafbf15c38a859ef1ea44173",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-apig",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/81/3e/3f5c2ebd1f402de16415f96889826fd2f809b7af0e34dcc4c534bdffe3f9/volcenginesdk_apig-5.0.57-py2.py3-none-any.whl",
      sha256: "be601d885b5b98f1ffc32cc56aad9660f40a8dfb54afa1bb05d15dd4c2aa6d0b",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-apig20221112",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/70/7d/dc511fb0119d9bb5da9be542b0a2b9bedfb02dccf71550683602e949648b/volcenginesdk_apig20221112-5.0.57-py2.py3-none-any.whl",
      sha256: "b0082d27e9330d69f6ad1b577b220c594b48994060aefd110366b3dd567087bf",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-apmplusserver",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/36/77/90a41669e9f1e189f123731570bceaebe35e2e3bf0a7cd7e94add8b39b07/volcenginesdk_apmplusserver-5.0.57-py2.py3-none-any.whl",
      sha256: "09b49d44f7957155c975129a809dc0b4ada51ce115c3e74906e5f1d72644ffc5",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-ark",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/d6/f2/0245b1236085b561ca7c497aebded5f1fc9cf5d28ab9c6d8a56db923ba50/volcenginesdk_ark-5.0.57-py2.py3-none-any.whl",
      sha256: "54e1821636e81de0182c20eeb60a13c7335493f230a41d14a7a87eddaa5ed636",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-arkclaw",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/3e/4b/bf2ec2160aa620c840dc3b82abacffb7e4c3a880d0cbe2a51db9d5294312/volcenginesdk_arkclaw-5.0.57-py2.py3-none-any.whl",
      sha256: "7d8c1d46b397b98fdb0b20fda8973f0765979a99a5e121bb5947fbbf2efcf972",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-autoscaling",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/a3/f0/7d1f5c6f5918045b3c7d7e6e78f5c38d8abcc0f86f639ca802d7cb46d9d0/volcenginesdk_autoscaling-5.0.57-py2.py3-none-any.whl",
      sha256: "9e1379750516ac8292058abbfa18789dd7fbcb0fc44cfe371293c2b0c60211d9",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-billing",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/3f/7c/3b5ccaa23176ed0d0076da68aadb395d76757257e3e87290b720fc50c101/volcenginesdk_billing-5.0.57-py2.py3-none-any.whl",
      sha256: "849b8ca74d2f20e070a4db43e955e0f7b945806805622064ae6f0893880fc5f1",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-bio",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/eb/26/75c5b800ee2d503b277aabfa2aed8d8e7cb9f5ed1eea2366e9a1c37861cf/volcenginesdk_bio-5.0.57-py2.py3-none-any.whl",
      sha256: "8e4bb73a93158e805245f9380a2ab0dd930b0b16761b6953ba3250979284f752",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-bmq",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/f0/6b/7e17e46712483e74d311d2cdacf2270da34000a36fb1fd5b1699ab61f54e/volcenginesdk_bmq-5.0.57-py2.py3-none-any.whl",
      sha256: "248eef35e85df0f56068578ce810da831ef702b9006f9e1ccd10f196a49dc85f",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-bmq20240901",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/18/98/9939c3205ea6630108383f13995ddaa0831f9056cb006966bf2da75c5639/volcenginesdk_bmq20240901-5.0.57-py2.py3-none-any.whl",
      sha256: "822ad43b9c09c5b336f8cd4b2bc33e341d1e1ec3be562a08e9f3ab9465ee6a58",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-bytehousece20240831",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/f0/a0/1e38bb86500a89b37b4bb986613a92adb1880de07fabbbba59d27ffaaa14/volcenginesdk_bytehousece20240831-5.0.57-py2.py3-none-any.whl",
      sha256: "7554da985b6bb2891b9834eac80712ab8694f034d3c3c9ebfe8ebfa7785badb0",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-cbr",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/5b/9c/45c2ce72c2ba730456cf1f8ca602b8946d1afb3aac1a9baa57717f28f60f/volcenginesdk_cbr-5.0.57-py2.py3-none-any.whl",
      sha256: "2732fd6ee4376c834d6b8d48e497221ccd951e814c407b52b1def3f557ab087b",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-cdn",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/bf/0b/0073ff906f0ee916e3ac58fa067c4a210b16564f2e0cac041069207e533d/volcenginesdk_cdn-5.0.57-py2.py3-none-any.whl",
      sha256: "dc5a39ccbe3a4fc0fad6361e040e5fb28ecb56f3a9ef4ea5fc42e2dbb62a6033",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-cen",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/4c/df/20e54dfac2290ec81627d343d335ed6a76b135b1e316b3af9165804e9826/volcenginesdk_cen-5.0.57-py2.py3-none-any.whl",
      sha256: "058a607990a2ab5c1bd441342287f199346efc550779c94dda09934eb0f40d1d",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-certificateservice",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/f9/46/3ac802227da4e257a8af32993a60320dd932a1c376847b32771c1d86b05f/volcenginesdk_certificateservice-5.0.57-py2.py3-none-any.whl",
      sha256: "b780a07e09a7af4745a9a0f1d24d712ec1c36decf5d29e4cb9bad98ae8bbddcb",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-cfs",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/b8/27/8f9840a2f9ac17e3265afdf6deb759475a166b6d742da3bc2fbb826ad40a/volcenginesdk_cfs-5.0.57-py2.py3-none-any.whl",
      sha256: "0fa484f56f8a5498759bb28a876a4023f38ef7d5e9a0ae21c4ce5890faa3fd23",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-clawsentry",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/25/fc/f6b395f274ae5ec207250a4aaa92827200b420ac0b183173106164f2657f/volcenginesdk_clawsentry-5.0.57-py2.py3-none-any.whl",
      sha256: "19daf4332ce85b10eb8ac402364549d3eb0cfd053f1ad9236b933ca0f70585e8",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-clb",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/e3/9e/522f313f6a0ba483b04d5f3ec3b3cc472a4658dd8daf29b1dd1d34c5c5e4/volcenginesdk_clb-5.0.57-py2.py3-none-any.whl",
      sha256: "83378979f175a5e180494affb0732ed0d11ae7f28d1ad4e6890e39566a64bc89",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-cloudcontrol",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/7f/d5/27d02beab6a6d20b595932f8e860db1d611a5501557a6e9340ff0841c415/volcenginesdk_cloudcontrol-5.0.57-py2.py3-none-any.whl",
      sha256: "7da465f8c40f64a2fda1c5863cd68e171708d1b9005aba8704dd83bc8e252add",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-clouddetect",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/38/d4/5f7d9ebf5028ab52d840d2eb2aebf439d177c9edffa94a0781d1ca135236/volcenginesdk_clouddetect-5.0.57-py2.py3-none-any.whl",
      sha256: "e7d40856f8bd73517e7051aa5127c5e587f7976b11f94918204d6510931793a7",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-clouddetect20251031",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/9d/0b/d53643fcac2e378986b564ab70c744b5139e84ce8c5dc0f5af6616976689/volcenginesdk_clouddetect20251031-5.0.57-py2.py3-none-any.whl",
      sha256: "a7e42ae287c806045882c0fce1e0e49e58122cc1fde948abc0281b259f10e69e",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-cloudidentity",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/5e/45/7c7d286af29ffacb20a8de3d84851522a5e386ba089a58fed861b19224d1/volcenginesdk_cloudidentity-5.0.57-py2.py3-none-any.whl",
      sha256: "4773ab4840761bbec43f2887175c8e63a612c241b4d1f97c902516f93970360b",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-cloudmonitor",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/b8/09/6c3ccbef22b286cab78449ebdf881b1a5a308af5a10f8cd7641cccc2da1e/volcenginesdk_cloudmonitor-5.0.57-py2.py3-none-any.whl",
      sha256: "da3a9d3401fdc82bb3b14c6c53e818c3a1c97e4c51214ab310508f8cefc715ad",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-cloudmonitor20251201",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/80/ef/af03f8f187aa635ae936f74dfbd1353b1ea80f006e28b6e51982ff970987/volcenginesdk_cloudmonitor20251201-5.0.57-py2.py3-none-any.whl",
      sha256: "74018c2aa22017fb94cae3ee12d98b308b585c54fb69aaf133b2c5ef9e1c80ad",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-cloudtrail",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/52/9b/2d56417c02f31f7d3f2a1393ebb9e1f341c88c0328d63c17a42d485972cc/volcenginesdk_cloudtrail-5.0.57-py2.py3-none-any.whl",
      sha256: "128299414e2ed89f6aae10886ef882e60331793686ded429eab3f9c027ce1b87",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-cloudtrail20180101",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/c6/a3/e11e5848bdd3339e1a10056c8c4f44e7fce52089e20e0727a696695d3adc/volcenginesdk_cloudtrail20180101-5.0.57-py2.py3-none-any.whl",
      sha256: "387b94c533add9c099879c9f303c6e6f9df85d9a0699a6e7d23dfba0f1d6818e",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-config",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/2a/0f/d5f1624fdd18792a8228594666078616297de3ddb36c15dfc2a0e942cea6/volcenginesdk_config-5.0.57-py2.py3-none-any.whl",
      sha256: "479287ff83243ea06a8804c2748b1f2f3548a1e8f932009c1cd5591e3e86f924",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-core",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/c3/25/a9c908b5fff3accf377ba18d463bf43dd4dea4cec233cff49ec1626e2fed/volcenginesdk_core-5.0.57-py2.py3-none-any.whl",
      sha256: "471b8491e52bf7b2e990ef9c08066d3a7a504aed4beede537868c5f34b868ae7",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-coze20250601",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/e9/e8/697cca2ac8b881d71093651650044231966c3d79c990ddadb449eca5a00d/volcenginesdk_coze20250601-5.0.57-py2.py3-none-any.whl",
      sha256: "7eab46e837f5c911b31ea38c676dee982435997bc71c90d17f287e600d3a3b02",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-cp",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/75/13/02c241a096e69d3df88ba91b0a005144d1c9ff1c6b296aaa8cf5c7c52c2b/volcenginesdk_cp-5.0.57-py2.py3-none-any.whl",
      sha256: "62d34cce84fa71ce77f18566729603ba9f0f7ba8416fea0b0735312628b23c77",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-cpaas",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/14/c5/15a006ad143d82860ad64bb7158311c0e10a018866737c1e18b648e04f44/volcenginesdk_cpaas-5.0.57-py2.py3-none-any.whl",
      sha256: "950971f63a14295ab6a8f0c7cdc893d5655236b11492c5508a78ffe4cde144fc",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-cr",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/7c/d7/d58b327c12a338a35b3ed8a4fa7d01892c0cbfc93d627fa4818582d38a56/volcenginesdk_cr-5.0.57-py2.py3-none-any.whl",
      sha256: "7b287e33237811a2e13869e21a1944f4b1bbbaa78b1f7ee5b0cc142d68b0a7a6",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-cv20240606",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/ee/f7/dbc67254baa3bd5f7203b210b937e36cb65b80ca5b712581380cc017b2de/volcenginesdk_cv20240606-5.0.57-py2.py3-none-any.whl",
      sha256: "88ee67df6a56a7981dd137f34c7484a1e7903a2ebabfeac13d1cc105df650e95",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-dataleap",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/3e/35/d494386b6fd3ace933c95015d264040348909be75d27be909e4882422b7b/volcenginesdk_dataleap-5.0.57-py2.py3-none-any.whl",
      sha256: "a556e8df7f9e8c74699566410e5a54a65c5913ada33d05de89ffc89a5efc3b1b",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-dataleap20260301",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/fd/c7/65ed8ff4f5e5e00e40a45a1758fe9776c12ba49fc71cc63aba5f46229b94/volcenginesdk_dataleap20260301-5.0.57-py2.py3-none-any.whl",
      sha256: "2d08a9f7fa7bcc4629aec5ed17111d84d652aa2756bfe6718f5d60bfa0c3c08f",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-dbw",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/96/fc/aed6e1e72ca315354cc01f94728ae06d46e683d5f647b19770fe9517f630/volcenginesdk_dbw-5.0.57-py2.py3-none-any.whl",
      sha256: "e38e2c99bf26c6161aa0a88beb277e9b67531a8c221882f071b227f1e59e73a1",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-directconnect",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/60/56/28a8c553e87dd69b11f92e6afc0d6b12c72489a655a321c6a504008978a8/volcenginesdk_directconnect-5.0.57-py2.py3-none-any.whl",
      sha256: "4b7cda2fff60fb03e4f1125450f4ceaff156671b71d1d391a4a556f3ee316649",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-dms",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/f9/db/f0176acfa7156e0cf056c0b745c6a934e77a23c25ba118b6eef297408f09/volcenginesdk_dms-5.0.57-py2.py3-none-any.whl",
      sha256: "33964898d04597181f90d2852f46e8631109a9090b9470346680a5eb1f42127b",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-dms20250101",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/f9/18/4315ff56edaba5877c10d569cd63edaa74c375f62da9a8ffd72c52da431b/volcenginesdk_dms20250101-5.0.57-py2.py3-none-any.whl",
      sha256: "7cd81b42bad01972e237d6293644c87589be64854c8ec81a360de056157d1d92",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-dns",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/3d/bc/fa27d9916d70e4470a7948dd5e93864ed11d08e333d4d97c0286ca14026e/volcenginesdk_dns-5.0.57-py2.py3-none-any.whl",
      sha256: "be136145aa74f8b799c7e2d65f3c0f55f4b8a2e75b0ebe9e4978c471c076e6ef",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-dramart",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/ac/cc/123b1eaf9c1ccd6cbf11d2d8d5da41a423a2dc6f10b69f4b8256c726a333/volcenginesdk_dramart-5.0.57-py2.py3-none-any.whl",
      sha256: "8bce7b83692c66e545e2f060181ac62883dab65081d0147aec2502c69ed630b4",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-dts",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/73/12/4408bd6ded478896f32b0ebc3f618ef75fefaf62fcab4b6943d9d7978026/volcenginesdk_dts-5.0.57-py2.py3-none-any.whl",
      sha256: "52b641c4d72f5398245a86a28aa48b9b4b8a52c090abc55098eb0e1921883d65",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-dts20180101",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/85/07/8bb153b8a53a6526a0594a1ddfd8cf9fe81eb1616f4d80111b49933719a4/volcenginesdk_dts20180101-5.0.57-py2.py3-none-any.whl",
      sha256: "03b3e848c8315c376bb09936aa71e0fd0ceaa05501e0dcb2b54413801b6331ec",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-ecs",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/34/e7/c922b48af3ef769f7550160a716f7d1b4b4d797d0cc026c3c8ac1095d3a5/volcenginesdk_ecs-5.0.57-py2.py3-none-any.whl",
      sha256: "6f478bd0cdeccfcf5e037b696d17d398e97df6445b045b9768935e4322ef0258",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-edx",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/73/b8/f0e1340c0e8990e722d9ecbba77ddabba8c2ef92347b8dd881e5d6f695bc/volcenginesdk_edx-5.0.57-py2.py3-none-any.whl",
      sha256: "09eb6ef080807176174f1bc2b930d9a01371b7b97b78999907426e43f137316e",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-efs",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/1a/96/9cdd4d345be79602df40ad8e74c65ce14c59a1028a86bd80665d0ca4f948/volcenginesdk_efs-5.0.57-py2.py3-none-any.whl",
      sha256: "4e4f67b106f1ab44f8943934f1d22abbe2d5d9529ac4700071fe2caa2159722f",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-emr",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/0e/4e/b1241caa780af14a0f2bc3f57fd0c61f6a8786c1149e8e26a0dcab393d74/volcenginesdk_emr-5.0.57-py2.py3-none-any.whl",
      sha256: "9e6e87a48392b7d908f8f7cf91e397c08c50d7b8d9a216dc90f932c0b1bc464a",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-escloud",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/3a/f3/355b21083a992bb9bad332e749079f92d5024c541b75563a980b340a7920/volcenginesdk_escloud-5.0.57-py2.py3-none-any.whl",
      sha256: "7ffe6b255211bc84e586b5ae936f695cc18b74715275e29a44f17cc8235759d7",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-fasttrack",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/54/26/f4d755a16a72ee522a0e87981e5272471913e04f157404340029eeee95ab/volcenginesdk_fasttrack-5.0.57-py2.py3-none-any.whl",
      sha256: "968c04482c9ecf6f034994ea57ac5884d16b7257a19f6a520c531659e8c3b7c6",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-filenas",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/11/c7/4e0c4ab9760660edb2fe297663d486500fce98903a13f5f9996c5e716f3f/volcenginesdk_filenas-5.0.57-py2.py3-none-any.whl",
      sha256: "827e49deffaeb8fa0d2bd01d5bd1ba6d14fe12168eebde7f77cdd48f362ebb71",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-flink20250101",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/82/42/dc257ba1013f5bb22692fb10de27b773022467cbc9f228547cb3e18837ff/volcenginesdk_flink20250101-5.0.57-py2.py3-none-any.whl",
      sha256: "850a4723acb50ba9c7b32ede538d5ff4b2655b981ea0dbdf5a2a09776542942e",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-fwcenter",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/7d/31/8ae351d815838fd55ed627570443bd6f182268b8537fb5142f4cb09879cd/volcenginesdk_fwcenter-5.0.57-py2.py3-none-any.whl",
      sha256: "5ac00af47068d6aef3976c201b58a2d488d2d6302001b9e6ea7c56af9d39eea2",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-ga",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/fd/f9/5a3eda95be824f06f7bac0acbb3f8b4b3c542a481b117583f22ec117ad35/volcenginesdk_ga-5.0.57-py2.py3-none-any.whl",
      sha256: "7b04e3755ecc0483f1046fc97f4bf935442d41ab1dfb7a7ed62894dcd4809572",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-graph",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/d6/25/4e0f87723d0ed77b684ab09f20ab465df183ea3ee2fe694ba8c2141f5b37/volcenginesdk_graph-5.0.57-py2.py3-none-any.whl",
      sha256: "54879fcb2bfd3b0b4309f2b66360ec1ed7b347bd8e90389058e163c2d038620f",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-graph20250815",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/d3/55/cf96352ea0a37a055e205f32c8ac80d0700e73cdcbd9020d434701417b6e/volcenginesdk_graph20250815-5.0.57-py2.py3-none-any.whl",
      sha256: "9b56ea88c6c087670a3c3d555238c6366abc05bb049e4b5c16532460ba7c0a6b",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-gtm",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/da/e8/1808db8bca373d98d5a1d4e3e441738c64ee45c500ddc09d4dc8de3de392/volcenginesdk_gtm-5.0.57-py2.py3-none-any.whl",
      sha256: "c7af22bf211f200f55d83b6258847d3a2ec9d685004369004337d9e99b654f07",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-hbase",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/9c/b6/c5fa4df132b1f2c81c2a5574adeb2c075987d2caf1e7b0ec46e16b0ee885/volcenginesdk_hbase-5.0.57-py2.py3-none-any.whl",
      sha256: "cf5962aa5737ac1609626e3f5b86ac198dd1d401449f322936f59a3d5d54301d",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-httpdns",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/06/c0/4a7991463e1bf3f2bda41cf5c765024c597911b3c6ec7f84687d3282289f/volcenginesdk_httpdns-5.0.57-py2.py3-none-any.whl",
      sha256: "eec8cb2bdcb101b6158bb2ab89f0889cfc9086e0a8d256678c417489435ede5e",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-i18nopenapi",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/c7/a1/0183ec3e62c717cacbb3d94d5f91e43aa45ea2870013a27cd10a2902d8cd/volcenginesdk_i18nopenapi-5.0.57-py2.py3-none-any.whl",
      sha256: "774f9344dc659360192435e7c0ec18813fc037b82fb352eba51821e829cbf556",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-iam",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/38/9e/51cf61815c486ca657e98bebb8ba22ae3186a7c5f896527a1a26667be7e4/volcenginesdk_iam-5.0.57-py2.py3-none-any.whl",
      sha256: "e86315ea966ad70c31b12b98f820e03eeabd0c3e226d35c5d19b0bc912e78cff",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-iam20210801",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/7b/30/195c2923885592dcf798c68454d2cd0cdd75dc2e090a85a7656eb59f1cfb/volcenginesdk_iam20210801-5.0.57-py2.py3-none-any.whl",
      sha256: "c298d6c0b3a8ae77172c7e4f76a3aa2a1455e447e068e206303339a8c6947f23",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-id",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/49/76/cc874b90caa5383bcff103b7605f4fc40324795bdf5c058b1c815838fb04/volcenginesdk_id-5.0.57-py2.py3-none-any.whl",
      sha256: "c64c72700b35f8704f0a31da19ab51d7ea3d0c42a6578db819f938041e6c3640",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-inframanager",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/15/ee/df3d8976d9efbdfde01d55aaaa74efe5472a2200f9ff24eefc446e591016/volcenginesdk_inframanager-5.0.57-py2.py3-none-any.whl",
      sha256: "ecca47368817984ba61df81c9591df087dfbfd66378ddd94069f6d61679b7160",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-insight",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/95/2a/66cafee12f6c0a1b5b54ee84f628c60ef2ccdee71ec7f357246a9b7330c3/volcenginesdk_insight-5.0.57-py2.py3-none-any.whl",
      sha256: "2298a0a2a83870907604b89a847d8f54271564350d2aa73190f26a65dcfe8de1",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-kafka",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/14/b6/9bf0d0e8ea1cdb7aeb0ab8813e84a5b3da5409b7fd242d7164026d920017/volcenginesdk_kafka-5.0.57-py2.py3-none-any.whl",
      sha256: "2bacddd9640067c984055de26be8c75aa16eeac5d64f99091fc2d565ded0e8e7",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-kms",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/19/da/3a39eacba282c5153815e052e6ae0895116f3733dcf3e6c958c479947ef0/volcenginesdk_kms-5.0.57-py2.py3-none-any.whl",
      sha256: "8c08cb0e9214869a2a338622b7346ffe5a4ca50c91371277400a3c339d9843db",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-livesaas",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/29/40/4620732c9e97f1c4bcc4b4be7f0c9c2e01439acd6689833303f6b0f489a6/volcenginesdk_livesaas-5.0.57-py2.py3-none-any.whl",
      sha256: "35aabb2edaceac4b4c322c2b6e79a887a8556b575383e87b8cee09ddc587b6b6",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-livesaas20230801",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/46/0c/e93e243ff01e1698b58d748dd83aeecc14b8bd04ed1c7bace736430e9f3e/volcenginesdk_livesaas20230801-5.0.57-py2.py3-none-any.whl",
      sha256: "e811a7d466d4d4523e6987d7011f63670ea76dacb4f88e85f1d43f8b2c37a228",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-llmscan",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/ed/25/b54a0ba08258e4d3c56db44e8f983c0d88935b569908de83558e58ec4f3e/volcenginesdk_llmscan-5.0.57-py2.py3-none-any.whl",
      sha256: "4c78f62dde293ab71f263c6b009faac640ebde37762d86ac216e92c5a0f6c66a",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-llmshield",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/8f/fe/125a6021b67e7cc018d846d69d0b7386c402db5609c8a05d6adde2c04d16/volcenginesdk_llmshield-5.0.57-py3-none-any.whl",
      sha256: "9269d872755d08c9d1e015f1920e5bbfa499b1611ba30a0ffafa1212d6a04c92",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-mcdn",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/c9/52/692f42389fef401a3c00a057a877707986ad036db2f46ecf41712aea8ad3/volcenginesdk_mcdn-5.0.57-py2.py3-none-any.whl",
      sha256: "d9ded066de9b98d1e7e49f980a7d4f118f411013ad99c44e5044dab1dbee0d1f",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-mcs",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/91/a9/52daa7c6f27a77f61d8f846c825511f9794bee64f2712e1d8a85b4d3c244/volcenginesdk_mcs-5.0.57-py2.py3-none-any.whl",
      sha256: "e215aa557a34258116a43c60b3cbf302310ce9b69f80a769144bd0c63da4aa9d",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-mem0",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/b9/af/a2a677557edf5e0edbf32d753412a5b4a173b07747e901ceff62c4f027ba/volcenginesdk_mem0-5.0.57-py2.py3-none-any.whl",
      sha256: "948fc54156c23c7af18868e4d32256ff0342cb771e392f5f51a0914e0ceacbdc",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-metakms",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/7b/8d/749645c57d796c0395e8d71987e9ff538f9ac037f223641d9a47892cd20c/volcenginesdk_metakms-5.0.57-py2.py3-none-any.whl",
      sha256: "5812b1ea24bb0152ab008b9f48f6472ae1cc3c589c66ac8605fdabe0394b5eee",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-milvus",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/c2/3f/80f6edddd019a6a87f9625167537f7e8bf88e409b637fb98fa03427bc207/volcenginesdk_milvus-5.0.57-py2.py3-none-any.whl",
      sha256: "f0ee296f27c366b3326bccd4bfd18c9e29417cadc1db00c08516760999da0204",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-mlplatform20240701",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/a5/07/4ac98416f9f2ce5a229cdccee267301b7c81f4575d5f87d4b889c5f697a5/volcenginesdk_mlplatform20240701-5.0.57-py2.py3-none-any.whl",
      sha256: "dff27c20e48cbe390b159b8e3b8ea7f44a79f2a2db68137f38fe5a769660c256",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-mongodb",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/7b/1e/b5a254fe459af15c4e40a7d3500dc01d1e17bf9accf4a6972a1ed62d9753/volcenginesdk_mongodb-5.0.57-py2.py3-none-any.whl",
      sha256: "cd87c2e4958e8d080e6e370ebdbf2d3a5f4fe0affd1f1bf683aee7af3ca1ad94",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-na",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/49/19/dfd915007db4601729aac2a53c64208a6a7d7b92cdcb3af0b1038c828fe3/volcenginesdk_na-5.0.57-py2.py3-none-any.whl",
      sha256: "b4dedb81b511a5876d62ce9dac69b452a30c6097c3ebeb9dfacc690936939bb0",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-natgateway",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/24/b7/da294b69605c7f17f87952abf81ba95877eab5023549445fcc8a1894fcfc/volcenginesdk_natgateway-5.0.57-py2.py3-none-any.whl",
      sha256: "4ea96a8e894f502304f91e977eb5bdbe92400fece674a7d0f64177f54d8c956f",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-nta",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/74/8c/e89222aba917f4bb3976652f9a850526f4aad8bbc62255b2ffb8898da889/volcenginesdk_nta-5.0.57-py2.py3-none-any.whl",
      sha256: "c1868f767afbe352d792c31f33c08be8200062b830d71f7b147301898cfb8099",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-organization",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/00/4f/cdb16a929f99eecfe48e6b3c64adcbddb079c099a2d66fc1aabc04cc8ca7/volcenginesdk_organization-5.0.57-py2.py3-none-any.whl",
      sha256: "b8ecb0e004ca18a8e7d777c397f42634ed47b0efe7537052772dc46ffffacfb2",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-origindefence",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/56/ff/fdcd60d9d5418665bcd80878a51da2bb31560acdf7e6ebcb5b4f23b83f62/volcenginesdk_origindefence-5.0.57-py2.py3-none-any.whl",
      sha256: "712097bbf0233ced40ca72cba507b84f7f1584e7eaddeccccfa6423071453198",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-partner",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/b9/6c/9cafbbb6ff08f0291df3ff5f31ed851c9b34755196133be6b5740d0c1d0e/volcenginesdk_partner-5.0.57-py2.py3-none-any.whl",
      sha256: "c13daea79289d4e025b41681c14b4e52e42073d209048ece304db9b119fa0cf2",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-pca",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/19/34/d535216f0ea5e938a5e08b5fcaa1ff1c351a7c0dee9e881ef0190910c7f2/volcenginesdk_pca-5.0.57-py2.py3-none-any.whl",
      sha256: "2b3345b507f7425eab0cec644d4c8a74b7cb33b9c22553624ca8ffba113bf30a",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-pca20251001",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/8c/a7/7a1243dc48af3e7e0083b55f8ba0902baf7b31133ed40046609cbc66b5a5/volcenginesdk_pca20251001-5.0.57-py2.py3-none-any.whl",
      sha256: "b90cce8f4887d68ae9945a260bffc5f1206c1db221bc0e4c9db853441d3cf79b",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-privatelink",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/a4/d2/c8037ab6a50f022934b859edd0828612fc110a4da59709458fedf59fdb64/volcenginesdk_privatelink-5.0.57-py2.py3-none-any.whl",
      sha256: "abf3ebf5763c44dd3df55dcad6e97df1fa9fc45ad70c1f84d793866f45e00bca",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-privatezone",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/52/43/6e1c326943be9f1659e88ed66b109a7b01c28aaf0772670d2a8bad721209/volcenginesdk_privatezone-5.0.57-py2.py3-none-any.whl",
      sha256: "b3e4179788809b78c5b110c873da7eb496e8d27793a736c7a80514407d84fe00",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-quota",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/25/f4/80128558db2060c0da6ab00006ff356bb39f68a18b33096840d1e94b5194/volcenginesdk_quota-5.0.57-py2.py3-none-any.whl",
      sha256: "0ddf7b2ad11fdb8ae18ed941b1c05682b086753ff471e98601a481fa78748843",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-rabbitmq",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/63/31/eca8cede1127967c4fa135439dbbd9a03e19c875bad92705b33ecc70cb64/volcenginesdk_rabbitmq-5.0.57-py2.py3-none-any.whl",
      sha256: "69f1de5d9c86cd144c1a05f0acb4fc0acb5d820bd1ca76433a1df4742be61a4e",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-rcs5g",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/0d/3e/89ca143dfc1ecf3fa74c9487221862fe4dbba46b422448509e53e6d0ea59/volcenginesdk_rcs5g-5.0.57-py2.py3-none-any.whl",
      sha256: "30b91d0e01f3745992c1e5e57f2ab28da3afea49c2a6ca52dfd42152c236a0dc",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-rdsmssql",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/d7/19/ade0875926a4319a0fb4b79cafb4023b606811266bf79105ef47bac6a4da/volcenginesdk_rdsmssql-5.0.57-py2.py3-none-any.whl",
      sha256: "d41cb03bcb573bbe6bb74cfeb536c3ffc437df699bbca97d86328afe70fc075c",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-rdsmysql",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/92/67/7d61f1bf6799a29b5ab2e20db4ae3046028383f676dffb01db93dbc65779/volcenginesdk_rdsmysql-5.0.57-py2.py3-none-any.whl",
      sha256: "b90341d474672574e438fa3df552411a2d587d731a9e134be519a8d0684722a0",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-rdsmysqlv2",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/b6/b4/8e7f20c101870b67bd87398f41fa91329f00def942b5922d4f1824ed2ba2/volcenginesdk_rdsmysqlv2-5.0.57-py2.py3-none-any.whl",
      sha256: "5824c29df6e86489fe65c85ceb302b4048099287816e394bcbed358e5f2fb293",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-rdspostgresql",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/1b/98/c4fd239266fb5ac70ef354fbeb2f03eaca3ac16ba99ab7fbbf543b8dbeb0/volcenginesdk_rdspostgresql-5.0.57-py2.py3-none-any.whl",
      sha256: "620969635b79d54d754ba3fc74d38f77cc5de3939b9b4f48a8f3723b4b7a9dea",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-redis",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/98/9b/04759962acd3598508a6a07d45ddb7c3a44150659fcdf25dd136c6788e70/volcenginesdk_redis-5.0.57-py2.py3-none-any.whl",
      sha256: "520e37d0d265c81228cfdcde52b7587e2bc8010b0d9292e0bbf2acbd55258b9c",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-resourcecenter",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/23/91/1813dc9a97bc6011d7389bcd8c40e915a2e2ef792c0b67a91b7a97ab7ec9/volcenginesdk_resourcecenter-5.0.57-py2.py3-none-any.whl",
      sha256: "e4c7ea42468a3a22c8d67b14590ad8eac3ec179b79769aaddf24c3ebeb6b2c0f",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-resourceshare",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/41/ff/3b1dc0693762ed4ec799b2df5a10fdd7590facdb1d96c5a42ab272c65d72/volcenginesdk_resourceshare-5.0.57-py2.py3-none-any.whl",
      sha256: "11de8c23b5b1292463824718e7abf199ecb911893b06c1075bb7498ed55e17d7",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-rocketmq",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/41/57/9f6b31d5e3ed7beb758c5c7bc035bfbaa7a5756e84645c63aec0c4b77056/volcenginesdk_rocketmq-5.0.57-py2.py3-none-any.whl",
      sha256: "2559acb226f453c87be2b73971209f719595718bbab212a5df5d5cdd156932a4",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-secagent",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/76/a5/c9ed9668c5fab1e348e01250c783540936183955e1666cc7548dad04eae3/volcenginesdk_secagent-5.0.57-py2.py3-none-any.whl",
      sha256: "3f74f9a9092f5ce3419ea4f764f9b0e3226119827e1b5b91d76f2f1b3022e55f",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-seccenter",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/27/24/ce8b7493733385224b0d9a49cb008ca05ef1efb9cffa15064a01c2b4aac9/volcenginesdk_seccenter-5.0.57-py2.py3-none-any.whl",
      sha256: "9a71a5da13e55943df9b0f9e045cf949d89af68922b1371e6103cba8fd76bc4d",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-seccenter20240508",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/cb/7a/846a25059c15761925e7bf0fd6e4a4ac88d2029746d5f64973097f1361ea/volcenginesdk_seccenter20240508-5.0.57-py2.py3-none-any.whl",
      sha256: "6320d4bd7e22c723835cf6c476bfa93590f7c2081d1fee7af28cc142db21f345",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-smc",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/f5/03/80352b0ce222537bf7f1b34f29f1f547fb3bed567724d9f247f34a369439/volcenginesdk_smc-5.0.57-py2.py3-none-any.whl",
      sha256: "47970ac0f97157a7c6f136d5af37b5094a17991eabe3a075a3c4d964df99a478",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-spark",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/a2/af/e3d41b177b0a8f63587437803efea655096e026c53d3d0a705ceb4182268/volcenginesdk_spark-5.0.57-py2.py3-none-any.whl",
      sha256: "50dad68c84f6c4926063eb92b5d2d2fec3ee53ec4f4ce1be29810581422cf47d",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-speechsaasprod",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/46/84/1b32bc51e3873364b0b0476bfe9a0f4ec7c9d9dd2b98688437c7095e3370/volcenginesdk_speechsaasprod-5.0.57-py2.py3-none-any.whl",
      sha256: "a257f80b6b6af3d2980754a1646f4e7d162600a1058cac0798920dcf149006f4",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-speechsaasprod20250521",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/5d/b8/8fe9551cd64f7fa34838f09d74186991c504429ff8ebbbd6f6f5f2879d82/volcenginesdk_speechsaasprod20250521-5.0.57-py2.py3-none-any.whl",
      sha256: "d8e969cc8c0c1594269f75de03d2705f957e1ca6b6d1ce679c333bf3a608bea0",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-sqs",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/5e/be/b8a51bf6a4fc75153135295897a2957ecf7c502762172475324a6e36888f/volcenginesdk_sqs-5.0.57-py2.py3-none-any.whl",
      sha256: "13c38f885fe3237161503b386000b2d3c94ec401b44aca98e4c18f05de0320d6",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-storageebs",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/a5/2b/300a7b4fcc8102f654786e40de99fc9666d2e470ee6e41c921412fda7b04/volcenginesdk_storageebs-5.0.57-py2.py3-none-any.whl",
      sha256: "335c79e85e6ae8ab42af2e55a87f3f0490ac1a9f009a016a5bb28e3435906135",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-sts",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/e7/ee/6674d0883538738bfa4303877cdcf6708f8accd0f6551a6e973e7cad7baf/volcenginesdk_sts-5.0.57-py2.py3-none-any.whl",
      sha256: "c0f11d504be9de36538e5d8957a85e07a34d510e74149c6af1c0bf30859623b8",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-tag",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/92/ae/932a7901a731067ef1be09d9f954e948b6688a9fae0f93a07607d952843e/volcenginesdk_tag-5.0.57-py2.py3-none-any.whl",
      sha256: "aeed2b1131ce5f458c64a057fd4cb476ea9c25e5253ba118ca00794ac863b880",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-tidb",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/9d/ec/18d4e92b28cc6737522596fd0143380b1cd9c98453357858fbd7933c4dfc/volcenginesdk_tidb-5.0.57-py2.py3-none-any.whl",
      sha256: "221e8dd7c2497fb011329eb16d27b64b3e3f0a9f7aca970889f6ded506c9a236",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-tis",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/d8/b3/4c1d0483e65e987c52762fa9a9aa6e2055cb5397e98ce575348aaba10e9a/volcenginesdk_tis-5.0.57-py2.py3-none-any.whl",
      sha256: "edfbda0fe29f86d4fc904d47fd1bf4a544c61867e151ddadbb7456924447cfb1",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-transitrouter",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/d1/46/a20a35d5e76b245d70f4a343e9f7b37c6eedd2cfb0076a40521bbdfdd7aa/volcenginesdk_transitrouter-5.0.57-py2.py3-none-any.whl",
      sha256: "55c23ea8b376bff4ddbe808b3089722a7601af909e46769c06bed71cdff4a7c9",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-translate20250301",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/d2/f5/aa5e0301d9b685d1e4378819bc4f3a74c25a3531a85cdf1edbfc16e3528e/volcenginesdk_translate20250301-5.0.57-py2.py3-none-any.whl",
      sha256: "fcc44579951c636b95307ee635dd9faeaf34f442d2041c126f415c98673aa61b",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-vedbm",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/a0/6f/df2503e25efc0e86f2a313ab0063c5da5567d75bbf81b39302aeec6567ac/volcenginesdk_vedbm-5.0.57-py2.py3-none-any.whl",
      sha256: "4c0f857333ac560c3ac92b4ac355c7f52a2bc081d0844808ad0ee5c00cd3eb94",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-veenedge",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/0f/0f/1cc8d7f7ac14fc3654bb476156aa44a3503f4d87ed67f64e1cbcf8470339/volcenginesdk_veenedge-5.0.57-py2.py3-none-any.whl",
      sha256: "c6135074d0b70258bac6437bc2753e4f96ab8dade4bdff2253600c290ae663b7",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-vefaas",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/49/68/f39b2ddaf4372f2cb966808ad5ed0fa4617272cdebc203b28ec561983867/volcenginesdk_vefaas-5.0.57-py2.py3-none-any.whl",
      sha256: "e6ede31254507e243cc450caf4af6e895dfde865fdaa971aaef671879abb5ffd",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-vefaasdev",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/05/17/c0d2eadce5a1d85a867ab3ce0aefdcf5809f7af33d09d83b4f960739913c/volcenginesdk_vefaasdev-5.0.57-py2.py3-none-any.whl",
      sha256: "5c5fd61b7369cb13ddb57d68628f6a24b4eb924edd523ec1eeaebd2f9bbf8ef3",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-veiapi",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/28/9f/cab727cce0c5af1bdeccde1509abbac1b4c28eb930a47da74dae298914a0/volcenginesdk_veiapi-5.0.57-py2.py3-none-any.whl",
      sha256: "9ddd4f21defd79bdae865fd0d04d5ce4bd6027b27631ed4b2c920ae007948f94",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-vepfs",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/ab/a9/dc5d53ddefd16c0aa795feff6e3c93266f66a4b0b5218d40744ca60e6547/volcenginesdk_vepfs-5.0.57-py2.py3-none-any.whl",
      sha256: "8414512e62036e03a3552c19e481a0eda1e28324a1c8f37e93d7d7d6dac6bc97",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-vikingdb",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/3d/6b/c9740c2740e421ad381403acb46029c1f53302c4de8597a544cbd16539bd/volcenginesdk_vikingdb-5.0.57-py2.py3-none-any.whl",
      sha256: "24a92a300cf4deb8a6ecbd9ad9c9a5e4714baa99442bb86f105ae7117ff90e2b",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-vke",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/4d/37/84b4aee05ad0abc58a59ae4f7bbebc944d1e9ac75795d0927c14092a91bb/volcenginesdk_vke-5.0.57-py2.py3-none-any.whl",
      sha256: "db80acc7cdaa9960e870b2aa85bb3684b7240f48001aa146277c5244eaaa4705",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-vmp",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/ba/e2/59365b5f526bd775c41807be78910d5225dc8125705449ff8ed20550a410/volcenginesdk_vmp-5.0.57-py2.py3-none-any.whl",
      sha256: "b275255d9786f06f539cddaf00a1ac0fbd59715aec6ae08b8e7046700a6ac576",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-vms",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/49/2e/3dd922ce45f0bc019c9a2477b664034a508c6af6efc424dcda3932927fe6/volcenginesdk_vms-5.0.57-py2.py3-none-any.whl",
      sha256: "8b3fdcc19a3cd20b14d05ccf2403991e8065b80501c1a2130b4c95376c69bad4",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-vod20250101",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/9a/b6/ce8b8961f5fdfd24669b5143e17eb4d50669ad5c706d8727d6e5769068d4/volcenginesdk_vod20250101-5.0.57-py2.py3-none-any.whl",
      sha256: "04ea8cb686569fd51c55fb4a4f169dc31393f141c71639cc0d7bb644c08b728f",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-vod20260101",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/c7/71/8dda51c9caed39d8d31fa6ad625f2b1560f6d16430307700093aba85519e/volcenginesdk_vod20260101-5.0.57-py2.py3-none-any.whl",
      sha256: "80a3ada728456b0962aa4716b3b7f92cac8f76f6d6571d818a7ed9f1a4f1f0e7",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-volcobserve",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/f1/6a/6aadb41b0dcb0cb016e05a905a1e586a18e7a3517767f53f0644c0e2d148/volcenginesdk_volcobserve-5.0.57-py2.py3-none-any.whl",
      sha256: "ed804cb067dce81c883423fa9bfdf154289a38bb79ff1ee468fe8abd80c2b0ce",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-volcsms",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/7f/f7/935aef6edba5023f28555b2841682c2314059e44e17cb96b79188c900b33/volcenginesdk_volcsms-5.0.57-py2.py3-none-any.whl",
      sha256: "9462177ed98dda09547b1d930a7dc802937f735ee1112f2c757df9d4815c03b7",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-vpc",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/4b/c4/27d64a80ee98e53ba1f59d767db5c67c7c6693f9edac723df2d0597b0d60/volcenginesdk_vpc-5.0.57-py2.py3-none-any.whl",
      sha256: "14e90323425c38d39b28770548f912e2e63843ff4737d27796903da02938a784",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-vpn",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/65/e3/573b7ab286ddacb7c2004da0de5edd8da676699dadcd40cae7084931d570/volcenginesdk_vpn-5.0.57-py2.py3-none-any.whl",
      sha256: "3f57ec02d287d8f747975d1cb83106751e42c5a9e27eea3cf06ce5fddea7d315",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-waf",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/b4/f9/b06fe414d845d8244b22f6f4d9238b7bcb0b6ecbe00a15efc1ea1afaa7c3/volcenginesdk_waf-5.0.57-py2.py3-none-any.whl",
      sha256: "9866de1d8885287fed50a7f9d2a1105c0ef40e8748287048f0e2358a2116261b",
      license: "Apache License 2.0"
    },
    {
      name: "volcenginesdk-wafruntime",
      version: "5.0.57",
      url: "https://files.pythonhosted.org/packages/a0/8c/2e12aab596433aac147f26adf83ec010c4deb5420b9326561bf8aa58e7ec/volcenginesdk_wafruntime-5.0.57-py2.py3-none-any.whl",
      sha256: "9dbb452c7da193d9f96e80b1f9623e3be13f187d772a6653f15f4a0e46ccd9ff",
      license: "Apache License 2.0"
    },
    {
      name: "w3lib",
      version: "2.6.0",
      url: "https://files.pythonhosted.org/packages/aa/51/c3a48500fd4f211126b09d07850df33874455c432b7e8e5e0cfef8fcf7ba/w3lib-2.6.0-py3-none-any.whl",
      sha256: "e62ce6b7f845b5e8588223d44e64990673a0fefd6815d6b3f2e6d39bf9ef308c",
      license: "BSD-3-Clause"
    },
    {
      name: "webencodings",
      version: "0.6.1",
      url: "https://files.pythonhosted.org/packages/77/c6/040cbc72480d789a5f40d63fb484d3106554c4dfa2d2b70ad5022057750f/webencodings-0.6.1-py3-none-any.whl",
      sha256: "7fab6269c8bf237c657876b52058ccb182e861518d1c695c1a9aaa8c1c105d5b",
      license: "See bundled dist-info license files"
    },
    {
      name: "websockets",
      version: "15.0.1",
      url: "https://files.pythonhosted.org/packages/7d/71/abf2ebc3bbfa40f391ce1428c7168fb20582d0ff57019b69ea20fa698043/websockets-15.0.1-cp312-cp312-win_amd64.whl",
      sha256: "fcd5cf9e305d7b8338754470cf69cf81f420459dbae8a3b40cee57417f4614a7",
      license: "BSD-3-Clause"
    },
    {
      name: "win32_setctime",
      version: "1.2.1",
      url: "https://files.pythonhosted.org/packages/bd/df/5593480bc1e932eeae28e4fa182ab68174edd0d77409ced3b6491d02d1d5/win32_setctime-1.2.1-py3-none-any.whl",
      sha256: "a9edc685b35414bec69392c866ed82456ad125ac4a6a4b703ec1d8b462d4f477",
      license: "MIT license"
    },
    {
      name: "wrapt",
      version: "2.5.2",
      url: "https://files.pythonhosted.org/packages/7d/0a/ab645f8b4c594cac2db49bbc805bff97a9d3f2944061b865f67e0351b6c8/wrapt-2.5.2-cp312-cp312-win_amd64.whl",
      sha256: "36021ef761856bdbc10d5f3da9a95af93ef60d6acf9c72c8f849937ba2b902aa",
      license: "BSD-2-Clause"
    },
    {
      name: "xxhash",
      version: "4.1.0",
      url: "https://files.pythonhosted.org/packages/4f/15/6b2b57633d88895fb36268445c2858fa7ad6b63df6ceed90dfcf22039b6f/xxhash-4.1.0-cp312-cp312-win_amd64.whl",
      sha256: "0e687251ab499b3e6efaa0ed18e65a577d805ee59d7ac5347716489f6972b7ac",
      license: "BSD-2-Clause"
    },
    {
      name: "yarl",
      version: "1.25.1",
      url: "https://files.pythonhosted.org/packages/bb/cc/51a7b4abf4ac593b8e7eb3794b28e5a35ae26eed8bc04787628d215af82f/yarl-1.25.1-cp312-cp312-win_amd64.whl",
      sha256: "7d575b54cb3863ef9bc290ea4b009999d55dc237326131e4853cf33e888fee03",
      license: "Apache-2.0"
    },
    {
      name: "zipp",
      version: "4.1.2",
      url: "https://files.pythonhosted.org/packages/b8/44/7bd2007260da11cccca29ba2d4c345f1287aa663db38ee7cefeabf6386a5/zipp-4.1.2-py3-none-any.whl",
      sha256: "b30cb6cd253122169c47de245ca24a86bac2a5d3802ba15bf7ba6414eb9e144d",
      license: "MIT"
    },
    {
      name: "zope.interface",
      version: "8.7",
      url: "https://files.pythonhosted.org/packages/c2/54/5311f7d2605c3693b1c729c2c3b171c60b11a6126a5f41dc44047e7493fb/zope_interface-8.7-cp312-cp312-win_amd64.whl",
      sha256: "68acf0f25707f9c6277552a3d10114405235385ea1f66bffc89612e0b84f6edd",
      license: "ZPL-2.1"
    }
  ],
  manifestSha256: "bd4d0e02913ce85d78d8b26b4cc016001043982ba280c2793b9bc0cf7a766d71",
  openViking: {
    version: "0.5.5",
    source: {
      filename: "openviking-0.5.5.tar.gz",
      url: "https://files.pythonhosted.org/packages/0f/d8/858cceeba435f6983ed6d05992c6a4ec9315b47045fba53d8c47699ce7a5/openviking-0.5.5.tar.gz",
      sha256: "038fa5cdd1c175ce7e8e08791fad999fda08f65a5ac7326ab1aa3b1a471d1d7d"
    }
  }
};

// src/main/openviking.ts
var import_node_child_process2 = require("node:child_process");
var import_node_net = require("node:net");
var import_node_crypto11 = require("node:crypto");
var import_promises18 = require("node:fs/promises");
var import_node_path18 = __toESM(require("node:path"), 1);
init_config();

// src/main/openviking-gateway.ts
var import_node_http3 = require("node:http");
var import_node_crypto8 = require("node:crypto");

// src/main/model-http-error.ts
var fields = ["messages", "tools", "tool_choice", "parallel_tool_calls", "max_tokens", "max_completion_tokens", "reasoning_effort", "chat_template_kwargs", "response_format", "stream", "stream_options", "temperature", "model"];
function modelRequestShape(body) {
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const roles = Object.fromEntries(["system", "developer", "user", "assistant", "tool"].map((role) => [role, messages.filter((m) => m?.role === role).length]));
  return {
    messages: messages.length,
    roles,
    tools: Array.isArray(body?.tools) ? body.tools.length : 0,
    fields: fields.filter((field) => Object.hasOwn(body ?? {}, field)),
    streaming: body?.stream === true,
    ...Number.isSafeInteger(body?.max_tokens) ? { maxTokens: body.max_tokens } : {},
    ...Number.isSafeInteger(body?.max_completion_tokens) ? { maxCompletionTokens: body.max_completion_tokens } : {}
  };
}
function classifyModelHttpError(raw) {
  let value;
  try {
    value = JSON.parse(raw.slice(0, 65536));
  } catch {
    return { reason: "unclassified" };
  }
  const error = value?.error ?? value;
  const text = [error?.message, error?.type, typeof error?.code === "string" ? error.code : void 0].filter((v) => typeof v === "string").join(" ").slice(0, 16e3).toLowerCase();
  const param = typeof error?.param === "string" && fields.includes(error.param) ? error.param : void 0;
  const reason = /too many|overload|server.{0,16}busy|concurren|queue.{0,30}(?:full|limit|exceed)|rate.?limit|capacity.{0,16}(?:exceed|limit)|max_num_seqs/.test(text) ? "capacity" : /out of memory|insufficient.{0,16}memory|kv.?cache.{0,30}(?:full|space|memory|exceed)/.test(text) ? "memory" : /context.{0,30}(?:length|limit|window)|input.{0,20}token.{0,20}(?:exceed|limit|long)|prompt.{0,20}(?:too long|exceed)/.test(text) ? "context-limit" : /max_(?:completion_)?tokens.{0,60}(?:exceed|greater|less|must|limit|maximum)|max.?output.?tokens/.test(text) ? "output-limit" : /(?:system|developer).{0,40}(?:message|role)|roles? must alternate|chat.{0,12}template/.test(text) ? "message-format" : /tool.{0,50}(?:schema|parser|choice|required|support|invalid)|function.{0,25}(?:schema|name|invalid)/.test(text) ? "tool-format" : /model.{0,50}(?:not found|does not exist|unknown|invalid|not available)/.test(text) ? "model-id" : /extra inputs|extra_forbidden|unsupported|unknown parameter|unrecognized|not permitted|unexpected keyword|reasoning_effort/.test(text) ? "unsupported-option" : /unauthori|api.?key|authentication|permission denied/.test(text) ? "authentication" : "unclassified";
  return { reason, ...param ? { field: param } : {} };
}
function modelHttpExplanation(reason) {
  return {
    capacity: "\uC11C\uBC84\uAC00 \uB3D9\uC2DC \uC694\uCCAD\xB7\uB300\uAE30\uC5F4 \uD55C\uB3C4\uC640 \uAD00\uB828\uB41C \uC624\uB958\uB97C \uBC18\uD658\uD588\uC2B5\uB2C8\uB2E4.",
    memory: "\uC11C\uBC84\uAC00 \uBAA8\uB378 \uBA54\uBAA8\uB9AC\xB7KV \uCE90\uC2DC \uBD80\uC871\uC744 \uBC18\uD658\uD588\uC2B5\uB2C8\uB2E4.",
    "context-limit": "\uC11C\uBC84\uAC00 \uC785\uB825 \uBB38\uB9E5 \uD55C\uB3C4 \uCD08\uACFC\uB97C \uBC18\uD658\uD588\uC2B5\uB2C8\uB2E4.",
    "output-limit": "\uC11C\uBC84\uAC00 \uCD9C\uB825 \uD1A0\uD070 \uC124\uC815\uC744 \uAC70\uC808\uD588\uC2B5\uB2C8\uB2E4.",
    "message-format": "\uC11C\uBC84\uAC00 \uBA54\uC2DC\uC9C0 \uC5ED\uD560\xB7\uB300\uD654 \uD15C\uD50C\uB9BF \uD615\uC2DD\uC744 \uAC70\uC808\uD588\uC2B5\uB2C8\uB2E4.",
    "tool-format": "\uC11C\uBC84\uAC00 \uB3C4\uAD6C \uC815\uC758\xB7\uB3C4\uAD6C \uC120\uD0DD \uD615\uC2DD\uC744 \uAC70\uC808\uD588\uC2B5\uB2C8\uB2E4.",
    "model-id": "\uC11C\uBC84\uAC00 \uBAA8\uB378 ID\uB97C \uAC70\uC808\uD588\uC2B5\uB2C8\uB2E4.",
    "unsupported-option": "\uC11C\uBC84\uAC00 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 \uC694\uCCAD \uC635\uC158\uC744 \uAC70\uC808\uD588\uC2B5\uB2C8\uB2E4.",
    authentication: "\uC11C\uBC84\uAC00 \uC778\uC99D\xB7\uC811\uADFC \uAD8C\uD55C\uC744 \uAC70\uC808\uD588\uC2B5\uB2C8\uB2E4.",
    unclassified: "\uC11C\uBC84\uC758 \uAD6C\uCCB4\uC801\uC778 \uAC70\uC808 \uC0AC\uC720\uB97C \uC548\uC804\uD558\uAC8C \uBD84\uB958\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."
  }[reason] ?? "";
}

// src/main/openviking-gateway.ts
var OpenVikingGateway = class {
  constructor(config, diagnostic) {
    this.config = config;
    this.diagnostic = diagnostic;
  }
  token = (0, import_node_crypto8.randomBytes)(32).toString("hex");
  baseUrl = "";
  server;
  pending = /* @__PURE__ */ new Set();
  counts = { completion: 0, embedding: 0 };
  activity() {
    return { ...this.counts };
  }
  async start() {
    if (!this.config.openViking) throw new Error("OpenViking \uC784\uBCA0\uB529 \uC124\uC815\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
    this.server = (0, import_node_http3.createServer)(async (req, res) => {
      if (req.headers.authorization !== `Bearer ${this.token}`) {
        res.writeHead(401).end();
        return;
      }
      const embedding = req.method === "POST" && req.url === "/v1/embeddings";
      const completion = req.method === "POST" && req.url === "/v1/chat/completions";
      if (!embedding && !completion) {
        res.writeHead(403).end();
        return;
      }
      let httpError, shape;
      const report = (code, httpStatus) => this.diagnostic?.({ schemaVersion: 1, recordedAt: (/* @__PURE__ */ new Date()).toISOString(), kind: embedding ? "embedding" : "completion", code, ...httpStatus ? { httpStatus } : {}, ...httpError ? { httpError } : {}, ...shape ? { requestShape: shape } : {} });
      const target = embedding ? this.config.openViking.embedding : this.config.openViking.vlm ?? this.config.model;
      const controller = new AbortController();
      this.pending.add(controller);
      res.once("close", () => controller.abort());
      const kind = embedding ? "embedding" : "completion";
      this.counts[kind]++;
      try {
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 4 * 1024 * 1024) throw new Error();
          chunks.push(chunk);
        }
        const body = JSON.parse(Buffer.concat(chunks).toString());
        shape = modelRequestShape(body);
        if (body.model !== target.id) {
          res.writeHead(403).end();
          return;
        }
        if (completion && (body.tools?.length || body.messages?.some((m) => typeof m.content !== "string" && m.content?.some((p) => p.type !== "text")))) {
          res.writeHead(403).end();
          return;
        }
        if (embedding) {
          delete body.dimensions;
          body.encoding_format = "float";
        }
        const upstream = await requestJSON(target.baseUrl.replace(/\/$/, "") + (embedding ? "/embeddings" : "/chat/completions"), {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${target.apiKey}` },
          body: JSON.stringify(body)
        });
        if (!upstream.ok) {
          httpError = classifyModelHttpError(await upstream.text());
          report("OV_MODEL_HTTP", upstream.status);
          res.writeHead(502).end(JSON.stringify({ error: { message: `\uC0AC\uB0B4 ${embedding ? "\uC784\uBCA0\uB529" : "\uBAA8\uB378"} HTTP ${upstream.status}: ${modelHttpExplanation(httpError.reason)}` } }));
          return;
        }
        if (embedding) {
          const result = await upstream.json();
          const expected = this.config.openViking.embedding.dimension;
          const count = typeof body.input === "string" ? 1 : Array.isArray(body.input) ? body.input.length : -1;
          if (!Array.isArray(result?.data) || result.data.length !== count || result.data.some((item) => !Array.isArray(item?.embedding) || item.embedding.length !== expected || item.embedding.some((v) => typeof v !== "number" || !Number.isFinite(v)))) {
            report("OV_EMBEDDING_DIMENSION");
            res.writeHead(502).end('{"error":{"message":"OV_EMBEDDING_DIMENSION"}}');
            return;
          }
          report("OV_MODEL_OK");
          res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(result));
          return;
        }
        report("OV_MODEL_OK");
        res.writeHead(200, { "Content-Type": upstream.headers.get("content-type") ?? "application/json" });
        if (upstream.body) {
          const reader = upstream.body.getReader();
          while (true) {
            const next = await reader.read();
            if (next.done) break;
            res.write(next.value);
          }
        }
        res.end();
      } catch {
        if (!controller.signal.aborted) report("OV_MODEL_CONNECTION");
        if (!res.headersSent) res.writeHead(502).end('{"error":{"message":"\uC9C0\uC2DD \uBAA8\uB378 \uC5F0\uACB0 \uC624\uB958"}}');
        else res.destroy();
      } finally {
        this.counts[kind]--;
        this.pending.delete(controller);
      }
    });
    await new Promise((resolve, reject) => {
      this.server.once("error", reject);
      this.server.listen(0, "127.0.0.1", resolve);
    });
    const a = this.server.address();
    if (!a || typeof a === "string") throw new Error("\uC9C0\uC2DD \uBAA8\uB378 \uC911\uACC4 \uD3EC\uD2B8 \uD560\uB2F9 \uC2E4\uD328");
    this.baseUrl = `http://127.0.0.1:${a.port}/v1`;
  }
  async close() {
    for (const pending of this.pending) pending.abort();
    this.server?.closeAllConnections();
    await new Promise((resolve) => {
      if (this.server?.listening) this.server.close(() => resolve());
      else resolve();
    });
  }
};

// src/main/openviking.ts
init_openviking_errors();

// src/main/parallel-files.ts
var import_node_crypto9 = require("node:crypto");
var import_node_fs3 = require("node:fs");
var import_promises16 = require("node:fs/promises");
var import_node_path16 = __toESM(require("node:path"), 1);
async function verifyFiles(root, files, progress) {
  const base = await (0, import_promises16.realpath)(root);
  let next = 0, done = 0, failed = false;
  const settled = await Promise.allSettled(Array.from({ length: Math.min(4, files.length) }, async () => {
    try {
      while (!failed && next < files.length) {
        const file = files[next++];
        if (!file || typeof file.path !== "string" || !/^[a-f0-9]{64}$/.test(file.sha256) || import_node_path16.default.isAbsolute(file.path) || /[\\:\x00-\x1f]/.test(file.path) || file.path.split("/").some((p) => !p || p === "." || p === "..")) throw Error("\uBC88\uB4E4 \uD30C\uC77C \uACBD\uB85C \uC624\uB958");
        const target = await (0, import_promises16.realpath)(import_node_path16.default.join(base, file.path)), relative = import_node_path16.default.relative(base, target);
        if (relative.startsWith("..") || import_node_path16.default.isAbsolute(relative) || !(await (0, import_promises16.lstat)(target)).isFile()) throw Error("\uBC88\uB4E4 \uD30C\uC77C \uBC94\uC704 \uC624\uB958");
        const hash2 = (0, import_node_crypto9.createHash)("sha256");
        for await (const chunk of (0, import_node_fs3.createReadStream)(target)) hash2.update(chunk);
        if (hash2.digest("hex") !== file.sha256) throw Error("\uBC88\uB4E4 \uD30C\uC77C \uBB34\uACB0\uC131 \uC624\uB958");
        progress?.(++done, files.length);
      }
    } catch (error) {
      failed = true;
      throw error;
    }
  }));
  const failure = settled.find((result) => result.status === "rejected");
  if (failure?.status === "rejected") throw failure.reason;
}

// src/main/personal-knowledge.ts
var import_node_child_process = require("node:child_process");
var import_node_crypto10 = require("node:crypto");
var import_node_fs4 = require("node:fs");
var import_promises17 = require("node:fs/promises");
var import_node_path17 = __toESM(require("node:path"), 1);
var import_node_util = require("node:util");
init_zod();
init_config();
var exec = (0, import_node_util.promisify)(import_node_child_process.execFile);
var rootPattern = /^viking:\/\/user\/(?!local-user$)[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
var MAX_PACK = 512 * 1024 * 1024;
var entrySchema = external_exports.object({
  sha256: external_exports.string().regex(/^[a-f0-9]{64}$/),
  root: external_exports.string().regex(rootPattern),
  roots: external_exports.array(external_exports.string()).max(64),
  status: external_exports.enum(["importing", "ready", "failed"]),
  files: external_exports.number().int().nonnegative(),
  importedAt: external_exports.string(),
  sourceRoot: external_exports.string().regex(rootPattern).optional(),
  imported: external_exports.boolean().optional(),
  lastStage: external_exports.string().regex(/^OV_PERSONAL_[A-Z_]+$/).optional(),
  lastHttpStatus: external_exports.number().int().min(100).max(599).optional()
}).strict();
var registrySchema = external_exports.object({ schemaVersion: external_exports.literal(1), entries: external_exports.array(entrySchema).max(32) }).strict();
var inspectPersonalPackPython = String.raw`
import json, re, stat, sys, zipfile
with zipfile.ZipFile(sys.argv[1]) as z:
    infos = z.infolist()
    if not infos or len(infos) > 200000: raise ValueError('OVPACK_ENTRIES')
    names = set(); total = 0
    for i in infos:
        n = i.filename
        if n in names or chr(92) in n or n.startswith('/') or ':' in n or any(x in ('.', '..') for x in n.rstrip('/').split('/')): raise ValueError('OVPACK_PATH')
        if stat.S_ISLNK(i.external_attr >> 16) or i.flag_bits & 1: raise ValueError('OVPACK_LINK')
        names.add(n); total += i.file_size
        if total > 2147483648: raise ValueError('OVPACK_EXPANDED_SIZE')
    top = {n.split('/')[0] for n in names}
    if len(top) != 1: raise ValueError('OVPACK_ROOT')
    base = next(iter(top)); p = base + '/_ovpack/manifest.json'
    if z.getinfo(p).file_size > 8388608: raise ValueError('OVPACK_MANIFEST_SIZE')
    m = json.loads(z.read(p))
    root = m.get('root', {}).get('uri', '')
    if m.get('format_version') != 3 or m.get('kind') != 'openviking.ovpack': raise ValueError('OVPACK_VERSION')
    if not re.fullmatch(r'viking://user/(?!local-user$)[A-Za-z0-9][A-Za-z0-9_-]{0,127}', root): raise ValueError('OVPACK_USER_ROOT')
    if m['root'].get('name') != base or root.rsplit('/', 1)[-1] != base: raise ValueError('OVPACK_ROOT_NAME')
    entries = m.get('entries', [])
    if not isinstance(entries, list): raise ValueError('OVPACK_MANIFEST_ENTRIES')
    roots = set(); files = 0
    for e in entries:
        rel = e.get('path', '')
        if not isinstance(rel, str) or chr(92) in rel or rel.startswith('/') or any(x in ('.','..') for x in rel.split('/')): raise ValueError('OVPACK_MANIFEST_PATH')
        parts = rel.split('/')
        if parts[0] in ('memories','resources','skills'): roots.add(root + '/' + parts[0])
        if len(parts) >= 3 and parts[0] == 'peers' and parts[2] == 'memories' and re.fullmatch(r'[A-Za-z0-9_.@-]{1,255}', parts[1]) and parts[1] not in ('.','..') and parts[1].count('@') <= 1: roots.add(root + '/peers/' + parts[1] + '/memories')
        if e.get('kind') == 'file': files += 1
    if not roots or len(roots) > 64: raise ValueError('OVPACK_SEARCH_ROOTS')
    print(json.dumps(dict(root=root, roots=sorted(roots), files=files, bytes=total)))
`;
function validRoot(root, base) {
  if (root === base + "/memories" || root === base + "/resources" || root === base + "/skills") return true;
  if (!root.startsWith(base + "/peers/")) return false;
  const parts = root.slice((base + "/peers/").length).split("/");
  return parts.length === 2 && parts[1] === "memories" && /^[A-Za-z0-9_.@-]{1,255}$/.test(parts[0]) && ![".", ".."].includes(parts[0]) && (parts[0].match(/@/g)?.length ?? 0) <= 1;
}
function uriAllowed(uri, roots) {
  return !/[%\\\x00-\x1f?#]/.test(uri) && !/(?:^|\/)\.{1,2}(?:\/|$)/.test(uri) && roots.some((root) => uri === root || uri.startsWith(root + "/"));
}
var PersonalKnowledge = class {
  constructor(directory3, python, transport, recovery) {
    this.directory = directory3;
    this.python = python;
    this.transport = transport;
    this.recovery = recovery;
  }
  operation = Promise.resolve();
  abort = new AbortController();
  request(root, route, options) {
    if (!rootPattern.test(root)) throw new Error("\uAC1C\uC778 \uC9C0\uC2DD \uC0AC\uC6A9\uC790 \uBC94\uC704\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
    return this.transport(root.slice("viking://user/".length), route, options);
  }
  get file() {
    return import_node_path17.default.join(this.directory, "personal-imports.json");
  }
  async registry() {
    let raw;
    try {
      raw = await (0, import_promises17.readFile)(this.file, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") return { schemaVersion: 1, entries: [] };
      throw error;
    }
    const registry = registrySchema.parse(JSON.parse(raw));
    if (registry.entries.some((e) => e.roots.some((r) => !validRoot(r, e.root)))) throw new Error("\uAC1C\uC778 \uC9C0\uC2DD \uB4F1\uB85D \uAE30\uB85D\uC758 \uBC94\uC704\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
    return registry;
  }
  async status() {
    const registry = await this.registry();
    return registry.entries.map(({ sha256, root, status, files, importedAt, sourceRoot, lastStage, lastHttpStatus }) => ({
      sha256,
      root,
      status,
      files,
      importedAt,
      ...sourceRoot ? { sourceRoot } : {},
      ...lastStage ? { lastStage } : {},
      ...lastHttpStatus ? { lastHttpStatus } : {}
    }));
  }
  async verifyIndex(entry, signal) {
    await this.request(entry.root, "/api/v1/system/wait", { method: "POST", body: {}, signal });
    for (const uri of entry.roots) {
      const report = await this.request(entry.root, "/api/v1/system/consistency", { method: "POST", body: { uri }, signal });
      if (report.result?.ok !== true) throw new Error("OV_PERSONAL_INDEX_INCOMPLETE");
    }
  }
  import(file, approve) {
    const run = this.operation.then(() => this.importOne(file, approve));
    this.operation = run.catch(() => {
    });
    return run;
  }
  async importOne(file, approve) {
    const signal = this.abort.signal;
    signal.throwIfAborted();
    const info = await (0, import_promises17.lstat)(file);
    if (!info.isFile() || info.isSymbolicLink() || info.size > MAX_PACK || info.size === 0) throw new Error("512 MiB \uC774\uD558\uC758 \uC77C\uBC18 .ovpack \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694.");
    await (0, import_promises17.mkdir)(this.directory, { recursive: true, mode: 448 });
    const stage = await (0, import_promises17.mkdtemp)(import_node_path17.default.join(this.directory, "personal-import-"));
    const snapshot = import_node_path17.default.join(stage, "source.ovpack");
    try {
      await (0, import_promises17.copyFile)(file, snapshot);
      if ((await (0, import_promises17.lstat)(snapshot)).size > MAX_PACK) throw new Error("\uAC00\uC838\uC624\uAE30 \uD30C\uC77C \uD06C\uAE30\uAC00 \uC81C\uD55C\uC744 \uCD08\uACFC\uD588\uC2B5\uB2C8\uB2E4.");
      const digest2 = (0, import_node_crypto10.createHash)("sha256");
      for await (const bytes of (0, import_node_fs4.createReadStream)(snapshot)) {
        signal.throwIfAborted();
        digest2.update(bytes);
      }
      const sha256 = digest2.digest("hex");
      let preview;
      try {
        const result = await exec(this.python, ["-I", "-B", "-c", inspectPersonalPackPython, snapshot], { windowsHide: true, timeout: 3e4, maxBuffer: 1024 * 1024, signal });
        preview = JSON.parse(result.stdout);
        if (!rootPattern.test(preview.root) || !Array.isArray(preview.roots) || preview.roots.some((r) => !validRoot(r, preview.root))) throw new Error();
      } catch {
        throw new Error("\uC0AC\uC6A9\uC790 \uC601\uC5ED\uC744 \uB0B4\uBCF4\uB0B8 OVPack v3\uC778\uC9C0 \uD655\uC778\uD558\uC138\uC694. \uC804\uCCB4 DB \uBC31\uC5C5\uC774\uB098 \uC798\uBABB\uB41C \uC555\uCD95 \uD30C\uC77C\uC740 \uAC00\uC838\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
      }
      const registry = await this.registry();
      const complete = registry.entries.find((e) => e.sha256 === sha256 && e.status === "ready");
      if (complete) {
        await this.request(complete.root, "/api/v1/fs/stat?uri=" + encodeURIComponent(complete.root), { signal });
        await this.verifyIndex(complete, signal);
        return { status: "already-imported", root: complete.root, sha256 };
      }
      const existing = registry.entries.slice().reverse().find((e) => e.sha256 === sha256);
      const collision = !!existing || registry.entries.some((e) => e.root === preview.root || e.sourceRoot === preview.root);
      const resume = existing?.imported === true && existing.status !== "ready";
      if (collision && !this.recovery) throw new Error("\uAC19\uC740 \uC0AC\uC6A9\uC790 \uC601\uC5ED\uC758 \uAC00\uC838\uC624\uAE30 \uAE30\uB85D\uC774 \uC788\uC2B5\uB2C8\uB2E4. \uAE30\uC874 \uC790\uB8CC\uC640 \uC2E4\uD328 \uC0C1\uD0DC\uB97C \uBCF4\uC874\uD588\uC73C\uBA70 \uC790\uB3D9 \uB36E\uC5B4\uC4F0\uAE30\uB294 \uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
      if (!resume && registry.entries.length >= 32) throw new Error("\uAC1C\uC778 \uC9C0\uC2DD \uAC00\uC838\uC624\uAE30 \uAC1C\uC218 \uC81C\uD55C\uC5D0 \uB3C4\uB2EC\uD588\uC2B5\uB2C8\uB2E4.");
      const isolated = collision && !resume;
      const user = "ned-import-" + (0, import_node_crypto10.randomUUID)().replaceAll("-", "");
      const destination = resume ? existing.root : isolated ? "viking://user/" + user : preview.root;
      const approved = await approve(
        "\uAC1C\uC778 \uACF5\uD1B5 \uC9C0\uC2DD \uAC00\uC838\uC624\uAE30",
        `\uC120\uD0DD\uD55C \uD30C\uC77C: ${file}
\uC6D0\uBCF8 \uC0AC\uC6A9\uC790 \uC601\uC5ED: ${preview.root}
\uB300\uC0C1: ${destination}
\uD30C\uC77C: ${preview.files}\uAC1C
SHA-256: ${sha256}

${resume ? "\uD30C\uC77C \uAC00\uC838\uC624\uAE30 \uC644\uB8CC \uAE30\uB85D\uC774 \uC788\uC5B4 \uAE30\uC874 \uC790\uB8CC\uB97C \uB36E\uC5B4\uC4F0\uC9C0 \uC54A\uACE0 \uC0C9\uC778\uB9CC \uB2E4\uC2DC \uD655\uC778\xB7\uBCF5\uAD6C\uD569\uB2C8\uB2E4." : isolated ? "\uC774\uC804 \uAE30\uB85D\uACFC \uC790\uB8CC\uB97C \uBCF4\uC874\uD558\uACE0 \uBCC4\uB3C4 \uC0AC\uC6A9\uC790 \uC601\uC5ED\uC5D0 \uBCF5\uAD6C\uD569\uB2C8\uB2E4. SDK\uB85C \uC6D0\uBCF8\xB7\uBCF5\uAD6C \uD328\uD0A4\uC9C0\uB97C \uAC80\uC99D\uD558\uBA70 \uD30C\uC77C \uB0B4\uC6A9\uC740 \uADF8\uB300\uB85C \uC720\uC9C0\uD569\uB2C8\uB2E4. \uC0AC\uC6A9\uC790 \uACBD\uB85C\uAC00 \uBC14\uB00C\uBBC0\uB85C \uBCA1\uD130\uB294 \uB2E4\uC2DC \uACC4\uC0B0\uD569\uB2C8\uB2E4." : "Ned\uC758 \uAC1C\uC778 \uC800\uC7A5\uC18C\uC5D0 \uAC00\uC838\uC635\uB2C8\uB2E4. \uAE30\uC874 \uB300\uC0C1\uC740 \uB36E\uC5B4\uC4F0\uC9C0 \uC54A\uC73C\uBA70 \uBCA1\uD130\uB294 \uD638\uD658\uB420 \uB54C \uC7AC\uC0AC\uC6A9\uD569\uB2C8\uB2E4."}
\uBAA8\uB4E0 \uD504\uB85C\uC81D\uD2B8\uC5D0\uC11C \uC77D\uAE30 \uC804\uC6A9\uC73C\uB85C \uAC80\uC0C9\uD569\uB2C8\uB2E4. \uB300\uD654/\uAC1C\uC778\uC815\uBCF4 \uAD00\uB9AC \uC790\uB8CC\uB294 \uBCF4\uC874\uD558\uB418 \uAC80\uC0C9 \uB3C4\uAD6C\uC5D0\uB294 \uB178\uCD9C\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC0AC\uC6A9\uC790 \uC2A4\uD0AC\uC740 \uC790\uB8CC\uB85C\uB9CC \uBCF4\uC874\uD558\uBA70 \uC2E4\uD589\uD615 \uD50C\uB7EC\uADF8\uC778\uC73C\uB85C \uC124\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.`,
        signal
      );
      if (!approved || signal.aborted) throw new Error("\uAC1C\uC778 \uC9C0\uC2DD \uAC00\uC838\uC624\uAE30\uB97C \uCDE8\uC18C\uD588\uC2B5\uB2C8\uB2E4.");
      const archive2 = import_node_path17.default.join(this.directory, "personal-" + sha256 + ".ovpack");
      await (0, import_promises17.copyFile)(snapshot, archive2, import_node_fs4.constants.COPYFILE_EXCL).catch(async (error) => {
        if (error.code !== "EEXIST") throw error;
        const stat = await (0, import_promises17.lstat)(archive2);
        if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_PACK) throw new Error("\uBCF4\uAD00\uD55C \uC6D0\uBCF8 OVPack\uC758 \uD30C\uC77C \uD615\uC2DD\uC774 \uBC14\uB00C\uC5C8\uC2B5\uB2C8\uB2E4. \uB36E\uC5B4\uC4F0\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.");
        const digest3 = (0, import_node_crypto10.createHash)("sha256");
        for await (const chunk of (0, import_node_fs4.createReadStream)(archive2)) digest3.update(chunk);
        if (digest3.digest("hex") !== sha256) throw new Error("\uBCF4\uAD00\uD55C \uC6D0\uBCF8 OVPack\uC774 \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB36E\uC5B4\uC4F0\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.");
      });
      const entry = resume ? existing : { sha256, root: destination, roots: preview.roots.map((root) => destination + root.slice(preview.root.length)), files: preview.files, status: "importing", importedAt: (/* @__PURE__ */ new Date()).toISOString(), ...isolated ? { sourceRoot: preview.root } : {} };
      entry.status = "importing";
      entry.lastHttpStatus = void 0;
      if (!resume) registry.entries.push(entry);
      await atomicJSON(this.file, registry);
      let stageName = "OV_PERSONAL_PREPARE";
      const checkpoint = async (name) => {
        stageName = name;
        entry.lastStage = name;
        await atomicJSON(this.file, registry);
        signal.throwIfAborted();
      };
      try {
        if (resume) {
          await checkpoint("OV_PERSONAL_REINDEX");
          for (const uri of entry.roots) await this.request(entry.root, "/api/v1/content/reindex", { method: "POST", body: { uri, mode: "vectors_only", wait: true }, signal });
        } else {
          let uploadFile = archive2;
          if (isolated) {
            await checkpoint("OV_PERSONAL_RECOVERY");
            const derived = import_node_path17.default.join(this.directory, "personal-" + sha256 + "-" + user + ".ovpack");
            const result = await exec(this.python, ["-I", "-B", this.recovery.script, archive2, derived, user, this.recovery.launcher, this.recovery.tokenizers], { windowsHide: true, maxBuffer: 1024 * 1024, signal }).catch((error) => {
              this.recovery?.diagnostic?.(String(error.stderr ?? error.code ?? "OV_RECOVERY_PROCESS"));
              throw error;
            });
            const proof = JSON.parse(result.stdout);
            if (proof.root !== entry.root || proof.sourceRoot !== preview.root || proof.contentBytesUnchanged !== true) throw new Error("\uBCF5\uAD6C \uD328\uD0A4\uC9C0 \uAC80\uC99D \uC2E4\uD328");
            uploadFile = derived;
          }
          await checkpoint("OV_PERSONAL_UPLOAD");
          const form = new FormData();
          form.append("file", await (0, import_node_fs4.openAsBlob)(uploadFile), "personal.ovpack");
          const upload = await this.request(entry.root, "/api/v1/resources/temp_upload", { method: "POST", body: form, signal });
          const id = upload.result?.temp_file_id;
          if (typeof id !== "string") throw new Error("\uAC1C\uC778 \uC9C0\uC2DD \uD30C\uC77C \uC804\uB2EC \uD655\uC778 \uC2E4\uD328");
          await checkpoint("OV_PERSONAL_IMPORT");
          const imported = await this.request(entry.root, "/api/v1/pack/import", { method: "POST", body: { temp_file_id: id, parent: "viking://user", on_conflict: "fail", vector_mode: isolated ? "recompute" : "auto" }, signal });
          if (imported.result?.uri !== entry.root) throw new Error("\uAC1C\uC778 \uC9C0\uC2DD \uAC00\uC838\uC624\uAE30 \uACBD\uB85C \uD655\uC778 \uC2E4\uD328");
          entry.imported = true;
          await atomicJSON(this.file, registry);
        }
        await checkpoint("OV_PERSONAL_INDEX");
        await this.verifyIndex(entry, signal);
        await checkpoint("OV_PERSONAL_VERIFY");
        await this.request(entry.root, "/api/v1/fs/stat?uri=" + encodeURIComponent(entry.root), { signal });
        signal.throwIfAborted();
        entry.status = "ready";
        await atomicJSON(this.file, registry);
        return { status: "imported", root: entry.root, sha256, files: entry.files };
      } catch (error) {
        entry.status = "failed";
        const http = error?.status;
        entry.lastStage = stageName;
        if (Number.isInteger(http)) entry.lastHttpStatus = http;
        await atomicJSON(this.file, registry);
        const code = stageName + (Number.isInteger(http) ? " HTTP " + http : "");
        throw new Error("\uAC1C\uC778 \uC9C0\uC2DD \uAC00\uC838\uC624\uAE30\uB97C \uC644\uB8CC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. [" + code + "] \uC6D0\uBCF8 OVPack\uACFC \uC2E4\uD328 \uAE30\uB85D\uC740 \uBCF4\uC874\uD588\uC2B5\uB2C8\uB2E4. \uAC19\uC740 \uD30C\uC77C\uC744 \uB2E4\uC2DC \uC120\uD0DD\uD558\uBA74 \uBCF5\uAD6C\uB97C \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uAE30\uC874 \uB300\uC0C1\uC740 \uC790\uB3D9 \uB36E\uC5B4\uC4F0\uAE30\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
      }
    } finally {
      await (0, import_promises17.rm)(stage, { recursive: true, force: true });
    }
  }
  async roots() {
    return (await this.registry()).entries.filter((e) => e.status === "ready").flatMap((e) => e.roots);
  }
  async search(query, limit) {
    const roots = await this.roots(), hits = [];
    for (const root of roots) {
      const base = root.split("/").slice(0, 4).join("/");
      const response = await this.request(base, "/api/v1/search/find", { method: "POST", body: { query, target_uri: root, limit, read_content: false }, signal: this.abort.signal });
      const result = response.result;
      for (const item of [...result?.memories ?? [], ...result?.resources ?? [], ...result?.skills ?? []])
        if (typeof item.uri === "string" && uriAllowed(item.uri, [root])) hits.push({ uri: item.uri, abstract: item.abstract, score: item.score });
    }
    const seen = /* @__PURE__ */ new Set();
    const results = hits.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).filter((h) => !seen.has(h.uri) && !!seen.add(h.uri)).slice(0, limit);
    return JSON.stringify({ source: "OpenViking", scope: "personal", importedAreas: (await this.registry()).entries.filter((e) => e.status === "ready").length, results });
  }
  async read(uri) {
    if (!uriAllowed(uri, await this.roots())) throw new Error("\uAC00\uC838\uC624\uAE30\uAC00 \uC644\uB8CC\uB41C \uAC1C\uC778 \uAE30\uC5B5\xB7\uC790\uB8CC\xB7\uC2A4\uD0AC \uBC94\uC704\uB9CC \uC77D\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");
    const base = uri.split("/").slice(0, 4).join("/");
    return JSON.stringify(await this.request(base, "/api/v1/content/read?uri=" + encodeURIComponent(uri) + "&limit=300", { signal: this.abort.signal }));
  }
  async close() {
    this.abort.abort();
    await this.operation;
  }
};

// src/main/openviking.ts
init_openviking_namespace();
var StartupFailure = class extends Error {
  constructor(code, detail = {}) {
    super(code);
    this.code = code;
    this.detail = detail;
  }
};
function startupHint(stderr) {
  if (/Ned tokenizer (?:cache|data)/.test(stderr)) return "tokenizer_cache";
  if (/DLL load failed|WinError (?:126|127|193)|cannot load library/i.test(stderr)) return "native_library";
  if (/ModuleNotFoundError|No module named/.test(stderr)) return "python_module";
  if (/ValidationError|validation error/i.test(stderr)) return "configuration";
  if (/PermissionError|WinError 5|Access is denied/i.test(stderr)) return "permission";
  if (/outbound connection is not an approved|external DNS is disabled/.test(stderr)) return "network_policy";
  return void 0;
}
function osError(error) {
  const code = error?.code;
  return typeof code === "string" && /^[A-Z][A-Z0-9_]{0,31}$/.test(code) ? code : void 0;
}
var pause = (ms) => new Promise((r) => setTimeout(r, ms));
function knowledgeRoot(project) {
  if (!/^[a-zA-Z0-9-]{1,128}$/.test(project)) throw new Error("\uD504\uB85C\uC81D\uD2B8 \uC9C0\uC2DD \uBC94\uC704\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
  return `viking://resources/ned/${project}`;
}
function scopedKnowledgeUri(project, uri) {
  const root = knowledgeRoot(project);
  if (!uri.startsWith(root + "/") || /(?:^|\/)\.{1,2}(?:\/|$)|[%\\\x00-\x1f?#]/.test(uri)) throw new Error("\uB2E4\uB978 \uD504\uB85C\uC81D\uD2B8\uC758 \uC9C0\uC2DD \uACBD\uB85C\uB294 \uC77D\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
  return uri;
}
var OpenVikingService = class {
  constructor(runtime, data, changed, testLaunch, skillBundle) {
    this.runtime = runtime;
    this.data = data;
    this.changed = changed;
    this.testLaunch = testLaunch;
    this.skillBundle = skillBundle;
  }
  value = { status: "unconfigured", indexedFiles: 0 };
  process;
  gateway;
  configFile;
  account = "ned";
  maintenance = false;
  baseUrl = "";
  token = "";
  exited = true;
  expectedExit = false;
  operation = Promise.resolve();
  stopped;
  diagnosticWrites = Promise.resolve();
  modelEvents = [];
  personal;
  namespaceAbort;
  startupStage = "bundle";
  lastConfig;
  state() {
    return structuredClone(this.value);
  }
  localPorts() {
    return [this.baseUrl, this.gateway?.baseUrl].filter((u) => !!u).map((u) => Number(new URL(u).port));
  }
  modelActivity() {
    return this.gateway?.activity() ?? { completion: 0, embedding: 0 };
  }
  async studioConnection() {
    this.ready();
    if (this.maintenance) throw new Error("\uC790\uB8CC \uC774\uAD00 \uC911\uC5D0\uB294 Studio\uB97C \uC5F4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
    await this.request("/health", void 0, 3e3);
    this.ready();
    return { baseUrl: this.baseUrl, headers: { ...this.credentials("local-user"), "X-OpenViking-Role": "admin" } };
  }
  update(status, message) {
    this.value.status = status;
    this.value.message = message;
    this.changed();
  }
  configure(config) {
    this.lastConfig = config;
    this.namespaceAbort?.abort();
    const namespaceAbort = new AbortController();
    this.namespaceAbort = namespaceAbort;
    this.operation = this.operation.catch(() => {
    }).then(async () => {
      await this.stop();
      this.value.skills = void 0;
      if (!config?.openViking) {
        this.value.embedding = void 0;
        this.update("unconfigured", "JSON\uC5D0 OpenViking \uC784\uBCA0\uB529 \uBAA8\uB378\uC744 \uC124\uC815\uD558\uC138\uC694.");
        return;
      }
      this.value.embedding = { baseUrl: config.openViking.embedding.baseUrl, id: config.openViking.embedding.id, dimension: config.openViking.embedding.dimension };
      if (!config.openViking.enabled) {
        this.update("disabled");
        return;
      }
      this.update("starting");
      try {
        await migrateVikingNamespace(import_node_path18.default.join(this.data, "openviking"), {
          start: (workspace, account) => this.start(config, workspace, account, true),
          stop: () => this.stop(),
          request: (route, options) => this.request(route, options?.body, false, options?.method, options?.signal),
          backup: (file, signal) => backupVikingAccount(this.baseUrl, this.credentials("local-user"), file, signal)
        }, namespaceAbort.signal).catch((error) => {
          this.startupStage = "namespace";
          throw new StartupFailure("OV_NAMESPACE", { osError: osError(error) });
        });
        namespaceAbort.signal.throwIfAborted();
        this.startupStage = "skills";
        if (this.skillBundle) await seedBundledSkills(this.skillBundle, import_node_path18.default.join(this.data, "openviking/data"), import_node_path18.default.join(this.data, "openviking/bundled-skills.json"), (state) => {
          this.value.skills = state;
          this.changed();
          this.diagnosticWrites = this.diagnosticWrites.catch(() => {
          }).then(() => atomicJSON(import_node_path18.default.join(this.data, "openviking/skills-status.json"), { schemaVersion: 1, recordedAt: (/* @__PURE__ */ new Date()).toISOString(), ...state }));
        }, namespaceAbort.signal);
        await this.start(config);
        this.update("ready");
        await this.writeStartupStatus({ status: "ready", stage: "health" });
      } catch (error) {
        const failure = error instanceof StartupFailure ? error : new StartupFailure(
          this.startupStage === "skills" ? "OV_SKILLS" : this.startupStage === "bundle" ? "OV_BUNDLE" : this.startupStage === "configuration" ? "OV_CONFIGURATION" : "OV_PROCESS_START",
          { osError: osError(error) }
        );
        let stopConfirmed = true;
        await this.stop().catch(() => {
          stopConfirmed = false;
        });
        const recorded = await this.writeStartupStatus({ status: "error", stage: this.startupStage, code: failure.code, ...failure.detail, stopConfirmed });
        const labels = {
          OV_BUNDLE: "OpenViking \uBC88\uB4E4 \uD30C\uC77C\uC744 \uC77D\uAC70\uB098 \uAC80\uC99D\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
          OV_SKILLS: "\uAE30\uBCF8 \uC2A4\uD0AC \uC900\uBE44 \uBB36\uC74C \uB610\uB294 \uAE30\uB85D\uC744 \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uAE30\uC874 \uB0B4\uC6A9\uC740 \uBCF4\uC874\uD588\uC2B5\uB2C8\uB2E4. Ned \uB300\uD654\uB294 \uACC4\uC18D \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
          OV_CONFIGURATION: "OpenViking \uC2E4\uD589 \uC124\uC815\uC744 \uC900\uBE44\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
          OV_PROCESS_START: "OpenViking Python \uD504\uB85C\uC138\uC2A4\uB97C \uC2E4\uD589\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
          OV_PROCESS_EXIT: "OpenViking\uC774 \uC900\uBE44\uB418\uAE30 \uC804\uC5D0 Python \uD504\uB85C\uC138\uC2A4\uAC00 \uC885\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
          OV_HEALTH_TIMEOUT: "OpenViking\uC758 \uB85C\uCEEC \uC900\uBE44 \uD655\uC778 \uC2DC\uAC04\uC774 \uCD08\uACFC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
          OV_NAMESPACE: "OpenViking \uC800\uC7A5\uC18C \uC774\uB984 \uC774\uAD00\uC744 \uC644\uB8CC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC6D0\uBCF8\uACFC \uC774\uAD00 \uC0AC\uBCF8\uC744 \uBCF4\uC874\uD588\uC2B5\uB2C8\uB2E4. \uD3F4\uB354\uB97C \uC9C1\uC811 \uBCC0\uACBD\uD558\uC9C0 \uB9D0\uACE0 namespace-migration.json\uACFC \uC9C4\uB2E8 \uC0C1\uD0DC\uB97C \uD655\uC778\uD558\uC138\uC694."
        };
        const detail = [failure.code, failure.detail.osError, failure.detail.exitHex, failure.detail.hint].filter(Boolean).join(", ");
        this.update("error", labels[failure.code] + " [" + detail + "]" + (recorded ? " \uC9C4\uB2E8 \uD30C\uC77C: \uC0AC\uC6A9\uC790 \uB370\uC774\uD130 \uD3F4\uB354\uC758 openviking/startup-status.json" : " \uC9C4\uB2E8 \uD30C\uC77C\uB3C4 \uC800\uC7A5\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.") + (stopConfirmed ? "" : " \uD504\uB85C\uC138\uC2A4 \uC885\uB8CC\uB97C \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC571\uC744 \uC885\uB8CC\uD558\uACE0 \uD655\uC778\uD558\uC138\uC694."));
      }
    });
    return this.operation;
  }
  async retryBundledSkills() {
    if (!this.lastConfig) throw Error("OpenViking \uC124\uC815\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.");
    if (this.value.status === "starting") throw Error("\uC9C0\uC2DD \uC11C\uBE44\uC2A4\uB97C \uC900\uBE44\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");
    await this.configure(this.lastConfig);
  }
  async writeStartupStatus(detail) {
    try {
      await atomicJSON(import_node_path18.default.join(this.data, "openviking", "startup-status.json"), { schemaVersion: 1, recordedAt: (/* @__PURE__ */ new Date()).toISOString(), ...detail });
      return true;
    } catch {
      return false;
    }
  }
  async resolveLaunch() {
    if (this.testLaunch) return this.testLaunch;
    const platform = process.platform === "win32" ? "windows-x64" : "linux-x64";
    const root = import_node_path18.default.join(this.runtime, platform, "openviking");
    const manifest = JSON.parse(await (0, import_promises18.readFile)(import_node_path18.default.join(root, "manifest.json"), "utf8"));
    if (manifest.version !== python_runtime_lock_default.openViking.version || !Array.isArray(manifest.files) || !manifest.files.length) throw new Error("OpenViking \uBC88\uB4E4 \uC5C6\uC74C");
    this.update("starting", "\uC9C0\uC2DD \uC11C\uBE44\uC2A4 \uD30C\uC77C\uC744 \uD655\uC778\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");
    await verifyFiles(root, manifest.files, (done, total) => {
      if (done === total || done % 100 === 0) this.update("starting", `\uC9C0\uC2DD \uC11C\uBE44\uC2A4 \uD30C\uC77C \uD655\uC778 ${done}/${total}`);
    });
    return { executable: import_node_path18.default.join(root, "python", process.platform === "win32" ? "python.exe" : "bin/python3"), launcher: import_node_path18.default.join(root, "launch.py"), cwd: root };
  }
  async start(config, workspace = import_node_path18.default.join(this.data, "openviking", "data"), account = vikingAccount, maintenance = false) {
    this.account = account;
    this.maintenance = maintenance;
    this.startupStage = "bundle";
    const launch2 = await this.resolveLaunch();
    this.personal = new PersonalKnowledge(
      import_node_path18.default.join(this.data, "openviking"),
      launch2.executable,
      (user, route, options) => this.request(route, options?.body, false, options?.method, options?.signal, user),
      { launcher: launch2.launcher, tokenizers: import_node_path18.default.join(launch2.cwd, "tokenizers"), diagnostic: this.testLaunch?.diagnostic, script: this.testLaunch ? import_node_path18.default.resolve("distribution/personal-pack-recovery.py") : import_node_path18.default.resolve(this.runtime, "../ned/personal-pack-recovery.py") }
    );
    this.startupStage = "configuration";
    const folder = import_node_path18.default.join(this.data, "openviking");
    await (0, import_promises18.mkdir)(folder, { recursive: true, mode: 448 });
    this.gateway = new OpenVikingGateway(config, (event) => {
      this.modelEvents.push(event);
      this.modelEvents = this.modelEvents.slice(-20);
      const events = structuredClone(this.modelEvents);
      this.diagnosticWrites = this.diagnosticWrites.catch(() => {
      }).then(() => atomicJSON(import_node_path18.default.join(folder, "model-status.json"), { schemaVersion: 1, events }));
    });
    await this.gateway.start();
    const reserve = (0, import_node_net.createServer)();
    await new Promise((resolve, reject) => {
      reserve.once("error", reject);
      reserve.listen(0, "127.0.0.1", resolve);
    });
    const address = reserve.address();
    if (!address || typeof address === "string") throw new Error("\uD3EC\uD2B8 \uD560\uB2F9 \uC2E4\uD328");
    const port = address.port;
    await new Promise((resolve) => reserve.close(() => resolve()));
    this.baseUrl = `http://127.0.0.1:${port}`;
    this.token = (0, import_node_crypto11.randomBytes)(32).toString("hex");
    const gateway = this.gateway;
    const embedding = config.openViking.embedding;
    const vlm = config.openViking.vlm ?? config.model;
    this.configFile = import_node_path18.default.join(folder, `runtime-${(0, import_node_crypto11.randomBytes)(8).toString("hex")}.json`);
    await atomicJSON(this.configFile, {
      storage: { workspace, agfs: { backend: "local" }, vectordb: { backend: "local", name: "context" } },
      server: { host: "127.0.0.1", port, workers: 1, auth_mode: "trusted", root_api_key: this.token },
      embedding: { dense: { provider: "openai", api_base: gateway.baseUrl, api_key: gateway.token, model: embedding.id, dimension: embedding.dimension } },
      vlm: { provider: "openai", api_base: gateway.baseUrl, api_key: gateway.token, model: vlm.id },
      telemetry: { tracer: { enabled: false } }
    });
    this.expectedExit = false;
    this.exited = false;
    this.startupStage = "process";
    this.update("starting", "\uC9C0\uC2DD \uC11C\uBE44\uC2A4 \uD504\uB85C\uC138\uC2A4\uB97C \uC2DC\uC791\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");
    let launchError;
    let stderr = "";
    let lastHealthStatus;
    this.process = (0, import_node_child_process2.spawn)(launch2.executable, ["-I", "-B", launch2.launcher, "--config", this.configFile, "--port", String(port)], {
      cwd: launch2.cwd,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        SYSTEMROOT: process.env.SYSTEMROOT,
        WINDIR: process.env.WINDIR,
        TEMP: process.env.TEMP,
        TMP: process.env.TMP,
        PATH: import_node_path18.default.dirname(launch2.executable),
        HOME: folder,
        USERPROFILE: folder,
        APPDATA: folder,
        LOCALAPPDATA: folder,
        HF_HUB_OFFLINE: "1",
        TRANSFORMERS_OFFLINE: "1",
        HF_HUB_DISABLE_TELEMETRY: "1",
        DO_NOT_TRACK: "1",
        OTEL_SDK_DISABLED: "true",
        LITELLM_LOCAL_MODEL_COST_MAP: "True",
        LITELLM_TELEMETRY: "False",
        NO_PROXY: "127.0.0.1,localhost",
        TIKTOKEN_CACHE_DIR: import_node_path18.default.join(launch2.cwd, "tokenizers")
      }
    });
    this.process.stdout.on("data", () => {
    });
    this.process.stderr.on("data", (bytes) => {
      const text = bytes.toString();
      stderr = (stderr + text).slice(-32768);
      launch2.diagnostic?.(text);
    });
    this.process.once("error", (error) => {
      launchError = osError(error) ?? "UNKNOWN";
      this.exited = true;
      if (!this.expectedExit) this.update("error", "OpenViking \uD504\uB85C\uC138\uC2A4\uB97C \uC2E4\uD589\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
    });
    this.process.once("exit", () => {
      this.exited = true;
      if (!this.expectedExit) this.update("error", "OpenViking\uC774 \uC885\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC124\uC815\uC5D0\uC11C \uB2E4\uC2DC \uC2DC\uC791\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");
    });
    const deadline = Date.now() + 45e3;
    this.startupStage = "health";
    this.update("starting", "\uC9C0\uC2DD \uC11C\uBE44\uC2A4\uC758 \uC751\uB2F5\uC744 \uD655\uC778\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.");
    while (Date.now() < deadline && !this.exited) {
      this.namespaceAbort?.signal.throwIfAborted();
      try {
        const response = await this.request("/health", void 0, 1e3);
        if (response) return;
      } catch (error) {
        const status = error?.status;
        if (typeof status === "number" && Number.isInteger(status)) lastHealthStatus = status;
      }
      await pause(200);
    }
    if (launchError) {
      this.startupStage = "process";
      throw new StartupFailure("OV_PROCESS_START", { osError: launchError });
    }
    if (this.exited) {
      this.startupStage = "process";
      const code = this.process.exitCode;
      throw new StartupFailure("OV_PROCESS_EXIT", {
        ...code === null ? {} : { exitCode: code, exitHex: "0x" + (code >>> 0).toString(16).padStart(8, "0") },
        ...this.process.signalCode ? { signal: this.process.signalCode } : {},
        hint: startupHint(stderr)
      });
    }
    throw new StartupFailure("OV_HEALTH_TIMEOUT", { healthStatus: lastHealthStatus, hint: startupHint(stderr) });
  }
  credentials(user) {
    return {
      Authorization: `Bearer ${this.token}`,
      "X-API-Key": this.token,
      "X-OpenViking-Account": this.account,
      "X-OpenViking-User": user,
      ...this.maintenance ? { "X-OpenViking-Role": "admin" } : {}
    };
  }
  async request(route, body, timeout = false, method, signal, user = "local-user") {
    const form = body instanceof FormData;
    const headers = { ...this.credentials(user), ...form ? {} : { "Content-Type": "application/json" } };
    const response = timeout === false && !form ? await requestJSON(this.baseUrl + route, { method: method ?? (body === void 0 ? "GET" : "POST"), headers, body: body === void 0 ? void 0 : JSON.stringify(body), signal }) : await fetch(this.baseUrl + route, { method: method ?? (body === void 0 ? "GET" : "POST"), redirect: "error", headers, body: body === void 0 ? void 0 : form ? body : JSON.stringify(body), signal: timeout === false ? signal : signal ? AbortSignal.any([signal, AbortSignal.timeout(timeout)]) : AbortSignal.timeout(timeout) });
    if (!response.ok) {
      const detail = await response.text();
      if (this.testLaunch?.diagnostic) this.testLaunch.diagnostic(`HTTP ${response.status} ${route}: ${detail}`);
      throw Object.assign(new Error(vikingErrorCode(detail)), { status: response.status });
    }
    const text = await response.text();
    if (text.length > 8 * 1024 * 1024) throw new Error("\uC9C0\uC2DD \uC751\uB2F5 \uD06C\uAE30 \uCD08\uACFC");
    const json = JSON.parse(text);
    if (json.status === "error") throw new Error(vikingErrorCode(text));
    return json;
  }
  ready() {
    if (this.value.status !== "ready" || this.exited) throw new Error("OpenViking\uC774 \uC900\uBE44\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uBAA8\uB378\xB7\uBC88\uB4E4 \uC124\uC815\uC744 \uD655\uC778\uD558\uC138\uC694.");
  }
  async importPersonal(file, approve) {
    this.ready();
    return this.personal.import(file, approve);
  }
  async personalStatus() {
    this.ready();
    return this.personal.status();
  }
  async personalSearch(query, limit) {
    this.ready();
    return this.personal.search(query, limit);
  }
  async personalRead(uri) {
    this.ready();
    return this.personal.read(uri);
  }
  async search(project, query, limit) {
    this.ready();
    const root = knowledgeRoot(project);
    const result = await this.request("/api/v1/search/find", { query, target_uri: root, limit, read_content: false });
    const matches2 = result.result ?? result;
    return JSON.stringify({ source: "OpenViking", project, results: matches2 });
  }
  async read(project, uri) {
    this.ready();
    const scoped = scopedKnowledgeUri(project, uri);
    return JSON.stringify(await this.request("/api/v1/content/read?uri=" + encodeURIComponent(scoped) + "&limit=300"));
  }
  async index(project, filename, content) {
    this.ready();
    if (Buffer.byteLength(content) > 2 * 1024 * 1024) throw new Error("2 MiB \uC774\uD558 \uD14D\uC2A4\uD2B8\uB9CC \uC0C9\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");
    const form = new FormData();
    form.append("file", new Blob([content], { type: "text/plain" }), import_node_path18.default.basename(filename).replace(/[^a-zA-Z0-9_.-]/g, "_") + ".txt");
    const response = await fetch(this.baseUrl + "/api/v1/resources/temp_upload", { method: "POST", redirect: "error", headers: this.credentials("local-user"), body: form, signal: AbortSignal.timeout(3e4) });
    if (!response.ok) {
      this.testLaunch?.diagnostic?.(`Upload HTTP ${response.status}: ${await response.text()}`);
      throw new Error("OpenViking \uD30C\uC77C \uC804\uB2EC \uC2E4\uD328");
    }
    const upload = await response.json();
    const id = upload.result?.temp_file_id ?? upload.temp_file_id;
    if (typeof id !== "string") throw new Error("OpenViking \uC5C5\uB85C\uB4DC \uD655\uC778 \uC2E4\uD328");
    const target = knowledgeRoot(project) + "/" + (0, import_node_crypto11.createHash)("sha256").update(filename).digest("hex").slice(0, 20);
    await this.request("/api/v1/resources", { temp_file_id: id, to: target, wait: true, reason: "\uC0AC\uC6A9\uC790\uAC00 \uC120\uD0DD\uD55C \uD504\uB85C\uC81D\uD2B8 \uD14D\uC2A4\uD2B8 \uD30C\uC77C", processing_mode: "vectors_only" });
    this.value.indexedFiles++;
    this.changed();
    return `OpenViking \uC0C9\uC778 \uC644\uB8CC: ${filename}`;
  }
  async stop() {
    this.expectedExit = true;
    await this.personal?.close();
    this.personal = void 0;
    await this.diagnosticWrites.catch(() => {
    });
    const child = this.process;
    if (child && !this.exited) {
      this.update("stopping");
      await new Promise((resolve, reject) => {
        const force = setTimeout(() => child.kill("SIGKILL"), 8e3);
        const timeout = setTimeout(() => {
          reject(new Error("OpenViking \uD504\uB85C\uC138\uC2A4 \uC885\uB8CC\uB97C \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."));
        }, 15e3);
        child.once("exit", () => {
          clearTimeout(force);
          clearTimeout(timeout);
          resolve();
        });
        child.stdin?.end();
      });
    }
    this.process = void 0;
    await this.gateway?.close();
    this.gateway = void 0;
    if (this.configFile) await (0, import_promises18.unlink)(this.configFile).catch(() => {
    });
    this.configFile = void 0;
  }
  async close() {
    this.namespaceAbort?.abort();
    if (this.stopped) return this.stopped;
    this.stopped = this.operation.catch(() => {
    }).then(() => this.stop());
    return this.stopped;
  }
};

// tests/openviking.integration.test.ts
init_contracts();
var executable = import_node_path19.default.resolve(process.env.NED_TEST_CURRENT_PYTHON ?? ".cache/openviking/env-linux/bin/python3");
(0, import_node_test6.test)("real pinned OpenViking registers default skill packages, restarts without duplicate indexing and keeps project knowledge scoped", { skip: !(0, import_node_fs5.existsSync)(executable), timeout: 3e5 }, async (t) => {
  const root = await (0, import_promises19.mkdtemp)(import_node_path19.default.join((0, import_node_os6.tmpdir)(), "ned-viking-"));
  const requests = [], inputs = [];
  const endpoint2 = (0, import_node_http4.createServer)(async (req, res) => {
    let raw = "";
    for await (const bytes of req) raw += bytes;
    requests.push(req.url);
    const body = JSON.parse(raw);
    inputs.push(JSON.stringify(body.input ?? body.messages).slice(0, 120));
    if (req.url === "/v1/chat/completions") {
      import_strict6.default.equal(body.model, "llm-test");
      import_strict6.default.equal(req.headers.authorization, "Bearer viking-test-key");
      res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ id: "viking-description", object: "chat.completion", model: "llm-test", choices: [{ index: 0, message: { role: "assistant", content: "Scoped local project document." }, finish_reason: "stop" }], usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 } }));
      return;
    }
    if (req.url !== "/v1/embeddings") {
      res.writeHead(400).end("{}");
      return;
    }
    import_strict6.default.equal(body.model, "embed-test");
    import_strict6.default.equal(req.headers.authorization, "Bearer embedding-test-key");
    const input = Array.isArray(body.input) ? body.input : [body.input];
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ object: "list", model: "embed-test", data: input.map((_, index) => ({ object: "embedding", index, embedding: [0.5, 0.25, 0.125, 0.75] })), usage: { prompt_tokens: 10, total_tokens: 10 } }));
  });
  await new Promise((resolve) => endpoint2.listen(0, "127.0.0.1", resolve));
  t.after(() => {
    endpoint2.closeAllConnections();
    endpoint2.close();
  });
  const port = endpoint2.address().port;
  const baseUrl = `http://127.0.0.1:${port}/v1`;
  const config = configSchema.parse({ schemaVersion: 2, model: { baseUrl, apiKey: "viking-test-key", id: "llm-test" }, openViking: { enabled: true, embedding: { baseUrl, apiKey: "embedding-test-key", id: "embed-test", dimension: 4 } } });
  let diagnostics = "";
  const inputSkills = process.env.NED_TEST_SKILLS_DIR ?? "vendor/skills", inputSeed = import_node_path19.default.join(inputSkills, "..", "skill-seed");
  const skills = import_node_path19.default.join(root, "resources/ned/skills");
  await (0, import_promises19.cp)(process.env.NED_TEST_TOKENIZERS_DIR ?? "vendor/runtime/windows-x64/openviking/tokenizers", import_node_path19.default.join(root, "tokenizers"), { recursive: true });
  await (0, import_promises19.cp)(inputSkills, skills, { recursive: true });
  await (0, import_promises19.cp)("skills-lock.json", import_node_path19.default.join(skills, "..", "skills-lock.json"));
  if ((0, import_node_fs5.existsSync)(import_node_path19.default.join(inputSeed, "manifest.json"))) await (0, import_promises19.cp)(inputSeed, import_node_path19.default.join(skills, "..", "skill-seed"), { recursive: true });
  const viking = new OpenVikingService(root, root, () => {
  }, { executable, launcher: import_node_path19.default.resolve("scripts/openviking-launch.py"), cwd: root, diagnostic: (text) => {
    diagnostics += text;
  } }, skills);
  t.after(async () => {
    await viking.close();
    await (0, import_promises19.rm)(root, { recursive: true, force: true });
  });
  await viking.configure(config);
  import_strict6.default.equal(viking.state().status, "ready", diagnostics);
  const waitForSkills = async () => {
    const deadline = Date.now() + 24e4;
    while (Date.now() < deadline && ["pending", "registering"].includes(viking.state().skills?.status ?? "")) await new Promise((resolve) => setTimeout(resolve, 100));
    import_strict6.default.equal(viking.state().skills?.status, "ready", JSON.stringify(viking.state().skills) + "\n" + diagnostics.slice(-12e3));
    import_strict6.default.equal(viking.state().skills?.registered, JSON.parse(await (0, import_promises19.readFile)("vendor/skills/manifest.json", "utf8")).skills.length);
  };
  await waitForSkills();
  import_strict6.default.equal(requests.length, 0, "prepared skills must not require a description or embedding model call");
  const connection = await viking.studioConnection();
  const skillResponse = await fetch(connection.baseUrl + "/api/v1/skills/ned-test-driven-development?target_uri=" + encodeURIComponent("viking://agent/skills") + "&include_content=true&include_integrity=true&include_source=true", { headers: connection.headers });
  import_strict6.default.equal(skillResponse.status, 200, await skillResponse.clone().text());
  import_strict6.default.ok(JSON.stringify(await skillResponse.json()).includes("ned-test-driven-development"));
  const settled = await fetch(connection.baseUrl + "/api/v1/system/wait", { method: "POST", headers: { ...connection.headers, "Content-Type": "application/json" }, body: JSON.stringify({ timeout: 60 }) });
  import_strict6.default.equal(settled.status, 200, await settled.clone().text());
  const afterFirstImport = requests.length;
  await viking.configure(config);
  await waitForSkills();
  import_strict6.default.equal(requests.length, afterFirstImport, "unchanged restarts must not send default skills for embedding again: " + JSON.stringify(inputs));
  await viking.index("p1", "hello.txt", "Ned tests local project knowledge.").catch((error) => import_strict6.default.fail(error.message + "\n" + diagnostics));
  const found = await viking.search("p1", "Ned", 3);
  import_strict6.default.ok(found.includes("p1"), found);
  await import_strict6.default.rejects(viking.read("p2", "viking://resources/ned/p1/file.txt"));
  import_strict6.default.ok(requests.every((route) => ["/v1/embeddings", "/v1/chat/completions"].includes(route)), JSON.stringify(requests));
  await viking.close();
});
