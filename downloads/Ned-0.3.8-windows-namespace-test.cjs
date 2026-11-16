"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// tests/openviking-namespace.integration.test.ts
var import_node_test = require("node:test");
var import_strict = __toESM(require("node:assert/strict"), 1);
var import_node_fs3 = require("node:fs");
var import_node_crypto7 = require("node:crypto");
var import_promises7 = require("node:fs/promises");
var import_node_http4 = require("node:http");
var import_node_child_process3 = require("node:child_process");
var import_node_util2 = require("node:util");
var import_node_os = require("node:os");
var import_node_path6 = __toESM(require("node:path"), 1);

// src/main/http-request.ts
var import_node_http = require("node:http");
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
      request = (target.protocol === "https:" ? import_node_https.request : import_node_http.request)(target, {
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
var import_node_crypto6 = require("node:crypto");
var import_promises6 = require("node:fs/promises");
var import_node_path5 = __toESM(require("node:path"), 1);

// src/main/config.ts
var import_promises = require("node:fs/promises");
var import_node_crypto = require("node:crypto");
var import_node_path = __toESM(require("node:path"), 1);

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

// node_modules/zod/v3/helpers/util.js
var util;
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
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
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
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
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
var getParsedType = (data) => {
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

// node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
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
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
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

// node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
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
var en_default = errorMap;

// node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path: path7, errorMaps, issueData } = params;
  const fullPath = [...path7, ...issueData.path || []];
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
var EMPTY_PATH = [];
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
var ParseStatus = class _ParseStatus {
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
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path7, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path7;
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
var handleResult = (ctx, result) => {
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
var ZodType = class {
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
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
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
var ZodString = class _ZodString extends ZodType {
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
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
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
var ZodBigInt = class _ZodBigInt extends ZodType {
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
var ZodBoolean = class extends ZodType {
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
var ZodDate = class _ZodDate extends ZodType {
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
var ZodSymbol = class extends ZodType {
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
var ZodUndefined = class extends ZodType {
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
var ZodNull = class extends ZodType {
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
var ZodAny = class extends ZodType {
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
var ZodUnknown = class extends ZodType {
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
var ZodNever = class extends ZodType {
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
var ZodVoid = class extends ZodType {
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
var ZodArray = class _ZodArray extends ZodType {
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
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
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
  setKey(key, schema) {
    return this.augment({ [key]: schema });
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
var ZodUnion = class extends ZodType {
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
var getDiscriminator = (type) => {
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
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
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
var ZodIntersection = class extends ZodType {
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
var ZodTuple = class _ZodTuple extends ZodType {
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
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
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
var ZodRecord = class _ZodRecord extends ZodType {
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
var ZodMap = class extends ZodType {
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
var ZodSet = class _ZodSet extends ZodType {
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
var ZodFunction = class _ZodFunction extends ZodType {
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
var ZodLazy = class extends ZodType {
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
var ZodLiteral = class extends ZodType {
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
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
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
var ZodNativeEnum = class extends ZodType {
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
var ZodPromise = class extends ZodType {
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
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
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
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
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
var ZodNullable = class extends ZodType {
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
var ZodDefault = class extends ZodType {
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
var ZodCatch = class extends ZodType {
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
var ZodNaN = class extends ZodType {
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
var BRAND = Symbol("zod_brand");
var ZodBranded = class extends ZodType {
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
var ZodPipeline = class _ZodPipeline extends ZodType {
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
var ZodReadonly = class extends ZodType {
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
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
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
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// src/shared/contracts.ts
var endpoint = external_exports.string().trim().url().superRefine((value, ctx) => {
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
var openVikingSchema = external_exports.object({
  enabled: external_exports.boolean().default(true),
  embedding: external_exports.object({ baseUrl: endpoint, apiKey: external_exports.string().trim().min(1).max(8192), id: external_exports.string().trim().min(1).max(256), dimension: external_exports.number().int().min(1).max(65536) }).strict(),
  vlm: external_exports.object({ baseUrl: endpoint, apiKey: external_exports.string().trim().min(1).max(8192), id: external_exports.string().trim().min(1).max(256) }).strict().optional()
}).strict();
var modelSchema = external_exports.object({ baseUrl: endpoint, apiKey: external_exports.string().trim().min(1).max(8192), id: external_exports.string().trim().min(1).max(256) }).strict();
var namedModelSchema = modelSchema.extend({ name: external_exports.string().trim().min(1).max(128), providerID: external_exports.string().optional(), modelKey: external_exports.string().optional() }).strict();
var providerSettings = external_exports.object({
  baseURL: endpoint,
  apiKey: external_exports.string().trim().min(1).max(8192).optional(),
  APIKey: external_exports.string().trim().min(1).max(8192).optional()
}).passthrough().superRefine((data, ctx) => {
  if (!data.apiKey && !data.APIKey) ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["apiKey"], message: "settings.apiKey \uB610\uB294 APIKey\uB97C \uC785\uB825\uD558\uC138\uC694." });
  if (data.apiKey && data.APIKey && data.apiKey !== data.APIKey) ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["APIKey"], message: "apiKey\uC640 APIKey\uC758 \uAC12\uC774 \uB2E4\uB985\uB2C8\uB2E4." });
});
var overlayFields = {
  settings: external_exports.record(external_exports.unknown()).optional(),
  body: external_exports.record(external_exports.unknown()).optional(),
  options: external_exports.record(external_exports.unknown()).optional()
};
function normalizeOverlay(value) {
  const { options } = value;
  if (!options) return value;
  const { chat_template_kwargs, extraBody, ...settings } = options;
  return {
    ...value,
    options: void 0,
    settings: { ...settings, ...value.settings },
    body: {
      ...extraBody && typeof extraBody === "object" && !Array.isArray(extraBody) ? extraBody : {},
      ...chat_template_kwargs === void 0 ? {} : { chat_template_kwargs },
      ...value.body
    }
  };
}
var variantID = external_exports.string().trim().min(1).max(128);
var variantOverlay = external_exports.object({ ...overlayFields, headers: external_exports.record(external_exports.string()).optional() }).passthrough().transform(({ settings, body, options, headers, ...legacy }) => normalizeOverlay({ settings, body, headers, options: { ...legacy, ...options } }));
var variantsSchema = external_exports.union([
  external_exports.array(external_exports.object({ id: variantID, ...overlayFields, headers: external_exports.record(external_exports.string()).optional() }).strict().transform(normalizeOverlay)).max(32),
  external_exports.record(variantID, variantOverlay).transform((value) => Object.entries(value).map(([id, overlay]) => ({ id, ...overlay })))
]).superRefine((value, ctx) => {
  if (value.length > 32 || new Set(value.map((v) => v.id)).size !== value.length)
    ctx.addIssue({ code: external_exports.ZodIssueCode.custom, message: "variant ID\uB294 \uACE0\uC720\uD574\uC57C \uD558\uBA70 32\uAC1C \uC774\uD558\uB85C \uC9C0\uC815\uD558\uC138\uC694." });
});
var providerModel = external_exports.object({
  name: external_exports.string().min(1).max(128).optional(),
  modelID: external_exports.string().min(1).max(256).optional(),
  capabilities: external_exports.object({ tools: external_exports.boolean().optional(), input: external_exports.array(external_exports.enum(["text", "image", "audio", "video", "pdf"])).optional(), output: external_exports.array(external_exports.enum(["text", "image", "audio", "video", "pdf"])).optional() }).passthrough().optional(),
  cost: external_exports.object({ input: external_exports.number().nonnegative(), output: external_exports.number().nonnegative(), cache: external_exports.object({ read: external_exports.number().nonnegative(), write: external_exports.number().nonnegative() }).optional() }).optional(),
  limit: external_exports.object({ context: external_exports.number().int().positive().optional(), input: external_exports.number().int().positive().optional(), output: external_exports.number().int().positive().optional() }).optional(),
  ...overlayFields,
  variants: variantsSchema.optional()
}).passthrough().transform(normalizeOverlay);
var providerSchema = external_exports.object({
  name: external_exports.string().min(1).max(128).optional(),
  package: external_exports.literal("@opencode/ai/providers/openai-compatible").default("@opencode/ai/providers/openai-compatible"),
  env: external_exports.array(external_exports.string().min(1).max(128)).max(32).optional(),
  settings: providerSettings,
  models: external_exports.record(external_exports.string().min(1).max(256).refine((value) => !value.includes("#")), providerModel).refine((value) => Object.keys(value).length > 0 && Object.keys(value).length <= 32)
}).strict();
var selectionSchema = external_exports.union([external_exports.string().min(3), external_exports.object({ providerID: external_exports.string().min(1), model: external_exports.string().min(1), variant: external_exports.string().optional() }).strict()]);
var rawConfigSchema = external_exports.object({
  schemaVersion: external_exports.union([external_exports.literal(1), external_exports.literal(2)]).default(2),
  model: external_exports.union([modelSchema, selectionSchema]).optional(),
  providers: external_exports.record(external_exports.string().min(1).max(128).refine((value) => !/[\/#]/.test(value)), providerSchema).optional(),
  models: external_exports.array(namedModelSchema).min(1).max(32).optional(),
  defaultModel: external_exports.string().max(128).optional(),
  defaultVariant: variantID.optional(),
  openViking: openVikingSchema.optional(),
  compaction: external_exports.object({ maxOutputTokens: external_exports.number().int().min(256).max(65536).default(8192), retryOnLength: external_exports.boolean().default(true), disableQwenThinking: external_exports.boolean().default(true) }).strict().optional()
}).strict();
var configSchema = rawConfigSchema.superRefine((data, ctx) => {
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
  const model = models?.find((m) => selection ? m.providerID === selection.providerID && m.modelKey === selection.model : m.name === data.defaultModel) ?? models?.[0] ?? data.model;
  return { ...data, ...selection && "variant" in selection && selection.variant ? { defaultVariant: selection.variant } : {}, ...models ? { models, defaultModel: models.find((m) => m === model)?.name ?? data.defaultModel } : {}, model: { baseUrl: model.baseUrl, apiKey: model.apiKey, id: model.id } };
});
var requestSchema = external_exports.discriminatedUnion("action", [
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

// src/main/config.ts
async function atomicJSON(file, value) {
  await (0, import_promises.mkdir)(import_node_path.default.dirname(file), { recursive: true, mode: 448 });
  const temp = `${file}.${(0, import_node_crypto.randomUUID)()}.tmp`;
  try {
    await (0, import_promises.writeFile)(temp, JSON.stringify(value, null, 2), {
      mode: 384,
      flag: "wx"
    });
    await (0, import_promises.rename)(temp, file);
  } finally {
    await (0, import_promises.unlink)(temp).catch(() => {
    });
  }
}

// src/main/openviking-gateway.ts
var import_node_http2 = require("node:http");
var import_node_crypto2 = require("node:crypto");
var OpenVikingGateway = class {
  constructor(config, diagnostic) {
    this.config = config;
    this.diagnostic = diagnostic;
  }
  token = (0, import_node_crypto2.randomBytes)(32).toString("hex");
  baseUrl = "";
  server;
  pending = /* @__PURE__ */ new Set();
  async start() {
    if (!this.config.openViking) throw new Error("OpenViking \uC784\uBCA0\uB529 \uC124\uC815\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
    this.server = (0, import_node_http2.createServer)(async (req, res) => {
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
      const report = (code, httpStatus) => this.diagnostic?.({ schemaVersion: 1, recordedAt: (/* @__PURE__ */ new Date()).toISOString(), kind: embedding ? "embedding" : "completion", code, ...httpStatus ? { httpStatus } : {} });
      const target = embedding ? this.config.openViking.embedding : this.config.openViking.vlm ?? this.config.model;
      const controller = new AbortController();
      this.pending.add(controller);
      res.once("close", () => controller.abort());
      try {
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 4 * 1024 * 1024) throw new Error();
          chunks.push(chunk);
        }
        const body = JSON.parse(Buffer.concat(chunks).toString());
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
          report("OV_MODEL_HTTP", upstream.status);
          res.writeHead(502).end(JSON.stringify({ error: { message: `\uC0AC\uB0B4 ${embedding ? "\uC784\uBCA0\uB529" : "\uBAA8\uB378"} HTTP ${upstream.status}` } }));
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

// src/main/openviking-skills.ts
var import_node_crypto4 = require("node:crypto");
var import_promises4 = require("node:fs/promises");
var import_node_zlib = require("node:zlib");
var import_node_path3 = __toESM(require("node:path"), 1);

// src/main/openviking-namespace.ts
var import_node_crypto3 = require("node:crypto");
var import_promises2 = require("node:fs/promises");
var import_node_path2 = __toESM(require("node:path"), 1);
var import_node_http3 = require("node:http");
var import_node_fs = require("node:fs");
var import_promises3 = require("node:stream/promises");
var import_node_stream = require("node:stream");
var vikingAccount = "ned";
var previousVikingAccount = "l-vibe";
var previousSkillPrefix = previousVikingAccount + "-";
var previousSkillOwner = "l_vibe_owner";
var previousSkillHash = "l_vibe_bundle_sha256";
async function backupVikingAccount(baseUrl, headers, file, signal) {
  const target = new URL("/api/v1/pack/backup", baseUrl);
  if (target.protocol !== "http:" || target.hostname !== "127.0.0.1") throw new Error("OV_NAMESPACE_ENDPOINT");
  const attempt = (vectors) => new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const body = JSON.stringify({ include_vectors: vectors });
    const req = (0, import_node_http3.request)(target, { method: "POST", headers: { ...headers, "Content-Type": "application/json", "Content-Length": String(Buffer.byteLength(body)) }, signal }, (res) => {
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
      (0, import_promises3.pipeline)(res, bound, (0, import_node_fs.createWriteStream)(file, { flags: "wx", mode: 384 }), { signal }).then(() => resolve(true), reject);
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
  const stat = await (0, import_promises2.lstat)(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1024 * 1024) throw new Error("OV_NAMESPACE_STATE");
  return (0, import_promises2.readFile)(file);
}
var fingerprint = (remote) => {
  if (!Array.isArray(remote?.files)) throw new Error("OV_NAMESPACE_SKILLS");
  return JSON.stringify(remote.files.filter((f) => !f.is_dir && !/(^|\/)\.(abstract|overview)\.md$/.test(f.path)).map((f) => ({ path: f.path, sha256: f.sha256 })).sort((a, b) => a.path.localeCompare(b.path)));
};
async function directory(file) {
  try {
    const stat = await (0, import_promises2.lstat)(file);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error("OV_NAMESPACE_PATH");
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}
async function exists(file) {
  try {
    await (0, import_promises2.lstat)(file);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}
async function noLinks(folder) {
  for (const entry of await (0, import_promises2.readdir)(folder, { withFileTypes: true })) {
    const file = import_node_path2.default.join(folder, entry.name), stat = await (0, import_promises2.lstat)(file);
    if (stat.isSymbolicLink() || !stat.isDirectory() && !stat.isFile()) throw new Error("OV_NAMESPACE_PATH");
    if (stat.isDirectory()) await noLinks(file);
  }
}
async function migrateVikingNamespace(folder, runtime, signal) {
  const active = import_node_path2.default.join(folder, "data"), journal = import_node_path2.default.join(folder, "namespace-migration.json");
  let record;
  try {
    const stat2 = await (0, import_promises2.lstat)(journal);
    if (!stat2.isFile() || stat2.isSymbolicLink() || stat2.size > 4096) throw new Error("OV_NAMESPACE_STATE");
    record = JSON.parse(await (0, import_promises2.readFile)(journal, "utf8"));
    if (record?.schemaVersion !== 1 || !/^[a-f0-9]{32}$/.test(record.id) || !["exporting", "restoring", "committing", "ready", "failed"].includes(record.phase)) throw new Error("OV_NAMESPACE_STATE");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const paths = (id) => {
    const backup = import_node_path2.default.join(folder, "namespace-backups", id);
    return { backup, stage: import_node_path2.default.join(backup, "staged"), source: import_node_path2.default.join(backup, "read-source"), original: import_node_path2.default.join(backup, "original"), pack: import_node_path2.default.join(backup, "snapshot.ovpack") };
  };
  const save = async (phase) => {
    record.phase = phase;
    await atomicJSON(journal, record);
  };
  const finishRegistry = async () => {
    if (!record?.registry) return;
    const base = paths(record.id).backup;
    const previous = await smallFile(import_node_path2.default.join(base, "bundled-skills.previous.json"));
    const next = await smallFile(import_node_path2.default.join(base, "bundled-skills.next.json"));
    skillRecords(previous);
    const parsed = skillRecords(next);
    const current = await smallFile(import_node_path2.default.join(folder, "bundled-skills.json"));
    const hash = (bytes) => (0, import_node_crypto3.createHash)("sha256").update(bytes).digest("hex");
    if (hash(current) === hash(next)) return;
    if (hash(current) !== hash(previous)) throw new Error("OV_NAMESPACE_REGISTRY_CONFLICT");
    await atomicJSON(import_node_path2.default.join(folder, "bundled-skills.json"), parsed);
  };
  if (record?.phase === "committing") {
    const p2 = paths(record.id);
    if (!await directory(p2.backup)) throw new Error("OV_NAMESPACE_STATE");
    if (await exists(p2.stage)) {
      if (!await directory(p2.stage) || !await directory(import_node_path2.default.join(p2.stage, "viking", vikingAccount)) || await exists(import_node_path2.default.join(p2.stage, "viking", previousVikingAccount))) throw new Error("OV_NAMESPACE_STATE");
      await noLinks(p2.stage);
    }
    if (!await exists(active) && await directory(p2.original) && await directory(p2.stage)) await (0, import_promises2.rename)(p2.stage, active);
    if (await directory(import_node_path2.default.join(active, "viking", vikingAccount)) && await directory(p2.original) && !await exists(p2.stage)) {
      await finishRegistry();
      await save("ready");
      return;
    }
    if (await directory(import_node_path2.default.join(active, "viking", previousVikingAccount)) && await directory(p2.stage) && !await exists(p2.original)) {
      await (0, import_promises2.rename)(active, p2.original);
      await (0, import_promises2.rename)(p2.stage, active);
      await finishRegistry();
      await save("ready");
      return;
    }
    throw new Error("OV_NAMESPACE_STATE");
  }
  if (!await directory(active)) return;
  const old = await directory(import_node_path2.default.join(active, "viking", previousVikingAccount));
  if (!old) return;
  if (await exists(import_node_path2.default.join(active, "viking", vikingAccount))) throw new Error("OV_NAMESPACE_CONFLICT");
  await noLinks(active);
  signal.throwIfAborted();
  record = { schemaVersion: 1, id: (0, import_node_crypto3.randomBytes)(16).toString("hex"), phase: "exporting" };
  const p = paths(record.id);
  await (0, import_promises2.mkdir)(import_node_path2.default.join(folder, "namespace-backups"), { recursive: true, mode: 448 });
  if (!await directory(import_node_path2.default.join(folder, "namespace-backups"))) throw new Error("OV_NAMESPACE_PATH");
  await (0, import_promises2.mkdir)(p.backup, { mode: 448 });
  await (0, import_promises2.mkdir)(p.stage, { mode: 448 });
  let registry;
  try {
    const bytes = await smallFile(import_node_path2.default.join(folder, "bundled-skills.json"));
    registry = skillRecords(bytes);
    await (0, import_promises2.writeFile)(import_node_path2.default.join(p.backup, "bundled-skills.previous.json"), bytes, { flag: "wx", mode: 384 });
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
    await (0, import_promises2.cp)(active, p.source, { recursive: true, force: false, errorOnExist: true, preserveTimestamps: true });
    signal.throwIfAborted();
    await runtime.start(p.source, previousVikingAccount);
    await call("/api/v1/system/wait", {});
    await runtime.backup(p.pack, signal);
    await runtime.stop();
    signal.throwIfAborted();
    const agentSource = import_node_path2.default.join(p.source, "viking", previousVikingAccount, "agent");
    const hasAgent = await directory(agentSource);
    if (hasAgent) {
      await (0, import_promises2.mkdir)(import_node_path2.default.join(p.stage, "viking", vikingAccount), { recursive: true, mode: 448 });
      await (0, import_promises2.cp)(agentSource, import_node_path2.default.join(p.stage, "viking", vikingAccount, "agent"), { recursive: true, force: false, errorOnExist: true, preserveTimestamps: true });
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
    }
    if (registry) await (0, import_promises2.writeFile)(import_node_path2.default.join(p.backup, "bundled-skills.next.json"), JSON.stringify(registry, null, 2) + "\n", { flag: "wx", mode: 384 });
    await runtime.stop();
    signal.throwIfAborted();
    if (!await directory(import_node_path2.default.join(p.stage, "viking", vikingAccount)) || await exists(import_node_path2.default.join(p.stage, "viking", previousVikingAccount))) throw new Error("OV_NAMESPACE_VERIFY");
    await save("committing");
    await (0, import_promises2.rename)(active, p.original);
    await (0, import_promises2.rename)(p.stage, active);
    await finishRegistry();
    await save("ready");
  } catch (error) {
    await runtime.stop();
    if (record.phase !== "committing") await save("failed");
    throw error;
  }
}

// src/main/openviking-skills.ts
var digest = (value) => (0, import_node_crypto4.createHash)("sha256").update(value).digest("hex");
var bundledSkillsRoot = "viking://agent/skills";
var bodyOf = (text) => text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
function safeRelative(value) {
  if (!value || import_node_path3.default.isAbsolute(value) || /[\\:\x00-\x1f]/.test(value) || value.split("/").some((p) => !p || p === "." || p === "..")) throw new Error("\uAE30\uBCF8 \uC2A4\uD0AC \uACBD\uB85C \uC624\uB958");
  return value;
}
function archive(files, name) {
  const local = [], central = [];
  let offset = 0;
  for (const [relative, bytes] of files) {
    const filename = Buffer.from(name + "/" + safeRelative(relative));
    const crc = (0, import_node_zlib.crc32)(bytes);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(67324752);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(2048, 6);
    header.writeUInt16LE(33, 12);
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(bytes.length, 18);
    header.writeUInt32LE(bytes.length, 22);
    header.writeUInt16LE(filename.length, 26);
    const directory3 = Buffer.alloc(46);
    directory3.writeUInt32LE(33639248);
    directory3.writeUInt16LE(20, 4);
    directory3.writeUInt16LE(20, 6);
    directory3.writeUInt16LE(2048, 8);
    directory3.writeUInt16LE(33, 14);
    directory3.writeUInt32LE(crc, 16);
    directory3.writeUInt32LE(bytes.length, 20);
    directory3.writeUInt32LE(bytes.length, 24);
    directory3.writeUInt16LE(filename.length, 28);
    directory3.writeUInt32LE(offset, 42);
    local.push(header, filename, bytes);
    central.push(directory3, filename);
    offset += header.length + filename.length + bytes.length;
  }
  const directory2 = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(101010256);
  end.writeUInt16LE(files.size, 8);
  end.writeUInt16LE(files.size, 10);
  end.writeUInt32LE(directory2.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory2, end]);
}
async function loadBundledSkillPackages(root) {
  const manifestBytes = await (0, import_promises4.readFile)(import_node_path3.default.join(root, "manifest.json"));
  const lock = JSON.parse(await (0, import_promises4.readFile)(import_node_path3.default.join(root, "..", "skills-lock.json"), "utf8"));
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  if (lock.schemaVersion !== 1 || lock.manifestSha256 !== digest(manifestBytes) || manifest.schemaVersion !== 1 || !Array.isArray(manifest.skills) || lock.count !== manifest.skills.length) throw new Error("\uAE30\uBCF8 \uC2A4\uD0AC \uBAA9\uB85D \uBB34\uACB0\uC131 \uC624\uB958");
  const base = await (0, import_promises4.realpath)(root), ids = /* @__PURE__ */ new Set();
  const packages = [];
  for (const entry of manifest.skills) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id) || entry.id.length > 56 || ids.has(entry.id) || entry.directory !== entry.id || !Array.isArray(entry.files) || entry.files.length > 500) throw new Error("\uAE30\uBCF8 \uC2A4\uD0AC \uD615\uC2DD \uC624\uB958");
    ids.add(entry.id);
    const name = "ned-" + entry.id, files = /* @__PURE__ */ new Map();
    let total = 0;
    for (const file of entry.files) {
      const relative = safeRelative(file.path);
      if (!/\.(md|txt)$/i.test(relative) && !/^(LICENSE|COPYING)$/i.test(import_node_path3.default.posix.basename(relative))) throw new Error("\uC2E4\uD589\uD615 \uC2A4\uD0AC \uD30C\uC77C \uCC28\uB2E8");
      const resolved = await (0, import_promises4.realpath)(import_node_path3.default.join(base, entry.directory, relative));
      const within = import_node_path3.default.relative(import_node_path3.default.join(base, entry.directory), resolved);
      if (within.startsWith("..") || import_node_path3.default.isAbsolute(within) || files.has(relative)) throw new Error("\uAE30\uBCF8 \uC2A4\uD0AC \uBC94\uC704 \uC624\uB958");
      const bytes2 = await (0, import_promises4.readFile)(resolved);
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
    packages.push({ id: entry.id, name, hash: digest(bytes), archive: bytes, body, files, source: entry.source, commit: entry.commit });
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
    saved = JSON.parse(await (0, import_promises4.readFile)(options.stateFile, "utf8"));
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
      if (remote && (owner !== "bundled-skills" || record && (record.revision !== remote.revision || record.bundleHash !== remoteHash))) {
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

// src/main/personal-knowledge.ts
var import_node_child_process = require("node:child_process");
var import_node_crypto5 = require("node:crypto");
var import_node_fs2 = require("node:fs");
var import_promises5 = require("node:fs/promises");
var import_node_path4 = __toESM(require("node:path"), 1);
var import_node_util = require("node:util");
var exec = (0, import_node_util.promisify)(import_node_child_process.execFile);
var rootPattern = /^viking:\/\/user\/(?!local-user$)[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
var MAX_PACK = 512 * 1024 * 1024;
var entrySchema = external_exports.object({
  sha256: external_exports.string().regex(/^[a-f0-9]{64}$/),
  root: external_exports.string().regex(rootPattern),
  roots: external_exports.array(external_exports.string()).max(64),
  status: external_exports.enum(["importing", "ready", "failed"]),
  files: external_exports.number().int().nonnegative(),
  importedAt: external_exports.string()
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
  constructor(directory2, python, transport) {
    this.directory = directory2;
    this.python = python;
    this.transport = transport;
  }
  operation = Promise.resolve();
  abort = new AbortController();
  request(root, route, options) {
    if (!rootPattern.test(root)) throw new Error("\uAC1C\uC778 \uC9C0\uC2DD \uC0AC\uC6A9\uC790 \uBC94\uC704\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
    return this.transport(root.slice("viking://user/".length), route, options);
  }
  get file() {
    return import_node_path4.default.join(this.directory, "personal-imports.json");
  }
  async registry() {
    let raw;
    try {
      raw = await (0, import_promises5.readFile)(this.file, "utf8");
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
    return registry.entries.map(({ sha256, root, status, files, importedAt }) => ({ sha256, root, status, files, importedAt }));
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
    const info = await (0, import_promises5.lstat)(file);
    if (!info.isFile() || info.isSymbolicLink() || info.size > MAX_PACK || info.size === 0) throw new Error("512 MiB \uC774\uD558\uC758 \uC77C\uBC18 .ovpack \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694.");
    await (0, import_promises5.mkdir)(this.directory, { recursive: true, mode: 448 });
    const stage = await (0, import_promises5.mkdtemp)(import_node_path4.default.join(this.directory, "personal-import-"));
    const snapshot = import_node_path4.default.join(stage, "source.ovpack");
    try {
      await (0, import_promises5.copyFile)(file, snapshot);
      if ((await (0, import_promises5.lstat)(snapshot)).size > MAX_PACK) throw new Error("\uAC00\uC838\uC624\uAE30 \uD30C\uC77C \uD06C\uAE30\uAC00 \uC81C\uD55C\uC744 \uCD08\uACFC\uD588\uC2B5\uB2C8\uB2E4.");
      const digest2 = (0, import_node_crypto5.createHash)("sha256");
      for await (const bytes of (0, import_node_fs2.createReadStream)(snapshot)) {
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
      const existing = registry.entries.find((e) => e.sha256 === sha256);
      if (existing?.status === "ready") {
        await this.request(existing.root, "/api/v1/fs/stat?uri=" + encodeURIComponent(existing.root), { signal });
        await this.verifyIndex(existing, signal);
        return { status: "already-imported", root: existing.root, sha256 };
      }
      if (existing || registry.entries.some((e) => e.root === preview.root)) throw new Error("\uAC19\uC740 \uC0AC\uC6A9\uC790 \uC601\uC5ED\uC758 \uAC00\uC838\uC624\uAE30 \uAE30\uB85D\uC774 \uC788\uC2B5\uB2C8\uB2E4. \uAE30\uC874 \uC790\uB8CC\uC640 \uC2E4\uD328 \uC0C1\uD0DC\uB97C \uBCF4\uC874\uD588\uC73C\uBA70 \uC790\uB3D9 \uB36E\uC5B4\uC4F0\uAE30\uB294 \uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
      if (registry.entries.length >= 32) throw new Error("\uAC1C\uC778 \uC9C0\uC2DD \uAC00\uC838\uC624\uAE30 \uAC1C\uC218 \uC81C\uD55C\uC5D0 \uB3C4\uB2EC\uD588\uC2B5\uB2C8\uB2E4.");
      const approved = await approve(
        "\uAC1C\uC778 \uACF5\uD1B5 \uC9C0\uC2DD \uAC00\uC838\uC624\uAE30",
        `\uC120\uD0DD\uD55C \uD30C\uC77C: ${file}
\uC6D0\uBCF8 \uC0AC\uC6A9\uC790 \uC601\uC5ED: ${preview.root}
\uD30C\uC77C: ${preview.files}\uAC1C
SHA-256: ${sha256}

Ned\uC758 \uAC1C\uC778 \uC800\uC7A5\uC18C\uC5D0 \uAC00\uC838\uC640 \uBAA8\uB4E0 \uD504\uB85C\uC81D\uD2B8\uC5D0\uC11C \uC77D\uAE30 \uC804\uC6A9\uC73C\uB85C \uAC80\uC0C9\uD569\uB2C8\uB2E4. \uAE30\uC874 \uB300\uC0C1\uC740 \uB36E\uC5B4\uC4F0\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uBCA1\uD130\uB294 \uD638\uD658\uB420 \uB54C \uC7AC\uC0AC\uC6A9\uD558\uACE0, \uD544\uC694\uD558\uBA74 \uC124\uC815\uD55C \uC0AC\uB0B4 \uC784\uBCA0\uB529 API\uB85C \uC7AC\uACC4\uC0B0\uD569\uB2C8\uB2E4. \uB300\uD654/\uAC1C\uC778\uC815\uBCF4 \uAD00\uB9AC \uC790\uB8CC\uB294 \uBCF4\uC874\uD558\uB418 \uAC80\uC0C9 \uB3C4\uAD6C\uC5D0\uB294 \uB178\uCD9C\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC0AC\uC6A9\uC790 \uC2A4\uD0AC\uC740 \uC790\uB8CC\uB85C\uB9CC \uBCF4\uC874\uD558\uBA70 \uC2E4\uD589\uD615 \uD50C\uB7EC\uADF8\uC778\uC73C\uB85C \uC124\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.`,
        signal
      );
      if (!approved || signal.aborted) throw new Error("\uAC1C\uC778 \uC9C0\uC2DD \uAC00\uC838\uC624\uAE30\uB97C \uCDE8\uC18C\uD588\uC2B5\uB2C8\uB2E4.");
      const archive2 = import_node_path4.default.join(this.directory, "personal-" + sha256 + ".ovpack");
      await (0, import_promises5.rename)(snapshot, archive2);
      const entry = { sha256, root: preview.root, roots: preview.roots, files: preview.files, status: "importing", importedAt: (/* @__PURE__ */ new Date()).toISOString() };
      registry.entries.push(entry);
      await atomicJSON(this.file, registry);
      let stageName = "OV_PERSONAL_UPLOAD";
      try {
        const form = new FormData();
        form.append("file", await (0, import_node_fs2.openAsBlob)(archive2), "personal.ovpack");
        const upload = await this.request(entry.root, "/api/v1/resources/temp_upload", { method: "POST", body: form, signal });
        const id = upload.result?.temp_file_id;
        if (typeof id !== "string") throw new Error("\uAC1C\uC778 \uC9C0\uC2DD \uD30C\uC77C \uC804\uB2EC \uD655\uC778 \uC2E4\uD328");
        stageName = "OV_PERSONAL_IMPORT";
        const imported = await this.request(entry.root, "/api/v1/pack/import", { method: "POST", body: { temp_file_id: id, parent: "viking://user", on_conflict: "fail", vector_mode: "auto" }, signal });
        if (imported.result?.uri !== entry.root) throw new Error("\uAC1C\uC778 \uC9C0\uC2DD \uAC00\uC838\uC624\uAE30 \uACBD\uB85C \uD655\uC778 \uC2E4\uD328");
        stageName = "OV_PERSONAL_INDEX";
        await this.verifyIndex(entry, signal);
        stageName = "OV_PERSONAL_VERIFY";
        await this.request(entry.root, "/api/v1/fs/stat?uri=" + encodeURIComponent(entry.root), { signal });
        signal.throwIfAborted();
        entry.status = "ready";
        await atomicJSON(this.file, registry);
        return { status: "imported", root: entry.root, sha256, files: entry.files };
      } catch (error) {
        entry.status = "failed";
        await atomicJSON(this.file, registry);
        const http = error?.status;
        const code = stageName + (Number.isInteger(http) ? " HTTP " + http : "");
        throw new Error("\uAC1C\uC778 \uC9C0\uC2DD \uAC00\uC838\uC624\uAE30\uB97C \uC644\uB8CC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. [" + code + "] \uC6D0\uBCF8 OVPack\uACFC \uC2E4\uD328 \uAE30\uB85D\uC740 \uBCF4\uC874\uD588\uC2B5\uB2C8\uB2E4. \uAE30\uC874 \uB300\uC0C1 \uCDA9\uB3CC\xB7OVPack \uAC80\uC99D\xB7\uC784\uBCA0\uB529 \uC5F0\uACB0\uC744 \uD655\uC778\uD558\uC138\uC694. \uC790\uB3D9 \uC7AC\uC2DC\uB3C4\uB098 \uB36E\uC5B4\uC4F0\uAE30\uB294 \uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
      }
    } finally {
      await (0, import_promises5.rm)(stage, { recursive: true, force: true });
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
  registration;
  registrationAbort;
  personal;
  namespaceAbort;
  startupStage = "bundle";
  state() {
    return structuredClone(this.value);
  }
  localPorts() {
    return [this.baseUrl, this.gateway?.baseUrl].filter((u) => !!u).map((u) => Number(new URL(u).port));
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
        await migrateVikingNamespace(import_node_path5.default.join(this.data, "openviking"), {
          start: (workspace, account) => this.start(config, workspace, account, true),
          stop: () => this.stop(),
          request: (route, options) => this.request(route, options?.body, false, options?.method, options?.signal),
          backup: (file, signal) => backupVikingAccount(this.baseUrl, this.credentials("local-user"), file, signal)
        }, namespaceAbort.signal).catch((error) => {
          this.startupStage = "namespace";
          throw new StartupFailure("OV_NAMESPACE", { osError: osError(error) });
        });
        namespaceAbort.signal.throwIfAborted();
        await this.start(config);
        this.update("ready");
        await this.writeStartupStatus({ status: "ready", stage: "health" });
        this.beginSkillRegistration();
      } catch (error) {
        const failure = error instanceof StartupFailure ? error : new StartupFailure(
          this.startupStage === "bundle" ? "OV_BUNDLE" : this.startupStage === "configuration" ? "OV_CONFIGURATION" : "OV_PROCESS_START",
          { osError: osError(error) }
        );
        let stopConfirmed = true;
        await this.stop().catch(() => {
          stopConfirmed = false;
        });
        const recorded = await this.writeStartupStatus({ status: "error", stage: this.startupStage, code: failure.code, ...failure.detail, stopConfirmed });
        const labels = {
          OV_BUNDLE: "OpenViking \uBC88\uB4E4 \uD30C\uC77C\uC744 \uC77D\uAC70\uB098 \uAC80\uC99D\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
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
    this.ready();
    if (["pending", "registering"].includes(this.value.skills?.status ?? "")) throw new Error("\uAE30\uBCF8 \uC2A4\uD0AC \uB4F1\uB85D\uC774 \uC9C4\uD589 \uC911\uC785\uB2C8\uB2E4. \uD604\uC7AC \uB2E8\uACC4\uC640 \uBAA8\uB378 \uC0C1\uD0DC\uB97C \uBA3C\uC800 \uD655\uC778\uD558\uC138\uC694.");
    await this.registration;
    this.ready();
    this.beginSkillRegistration();
  }
  beginSkillRegistration() {
    if (!this.skillBundle) return;
    const abort = new AbortController();
    this.registrationAbort = abort;
    this.value.skills = { status: "pending", registered: 0, total: 0, conflicts: [], failed: [] };
    this.changed();
    const publish = (state) => {
      if (abort.signal.aborted) return;
      this.value.skills = state;
      this.changed();
      const snapshot = structuredClone(state);
      this.diagnosticWrites = this.diagnosticWrites.catch(() => {
      }).then(() => atomicJSON(
        import_node_path5.default.join(this.data, "openviking/skills-status.json"),
        { schemaVersion: 1, recordedAt: (/* @__PURE__ */ new Date()).toISOString(), ...snapshot }
      ));
    };
    this.registration = registerBundledSkills({
      bundle: this.skillBundle,
      stateFile: import_node_path5.default.join(this.data, "openviking/bundled-skills.json"),
      signal: abort.signal,
      transport: (route, options) => this.request(route, options?.body, false, options?.method, options?.signal),
      progress: publish
    }).then(() => {
    }, () => {
      if (!abort.signal.aborted) publish({ ...this.value.skills, status: "error", message: "OV_SKILL_SETUP: \uBC88\uB4E4 \uB610\uB294 \uB4F1\uB85D \uAE30\uB85D\uC744 \uD655\uC778\uD558\uC138\uC694. \uAE30\uC874 \uAE30\uB85D\uC744 \uC0AD\uC81C\uD558\uC9C0 \uB9C8\uC138\uC694." });
    });
  }
  async writeStartupStatus(detail) {
    try {
      await atomicJSON(import_node_path5.default.join(this.data, "openviking", "startup-status.json"), { schemaVersion: 1, recordedAt: (/* @__PURE__ */ new Date()).toISOString(), ...detail });
      return true;
    } catch {
      return false;
    }
  }
  async resolveLaunch() {
    if (this.testLaunch) return this.testLaunch;
    const platform = process.platform === "win32" ? "windows-x64" : "linux-x64";
    const root = import_node_path5.default.join(this.runtime, platform, "openviking");
    const manifest = JSON.parse(await (0, import_promises6.readFile)(import_node_path5.default.join(root, "manifest.json"), "utf8"));
    if (manifest.version !== python_runtime_lock_default.openViking.version || !Array.isArray(manifest.files) || !manifest.files.length) throw new Error("OpenViking \uBC88\uB4E4 \uC5C6\uC74C");
    for (const f of manifest.files) {
      if (typeof f.path !== "string" || import_node_path5.default.isAbsolute(f.path) || f.path.split("/").includes("..") || (0, import_node_crypto6.createHash)("sha256").update(await (0, import_promises6.readFile)(import_node_path5.default.join(root, f.path))).digest("hex") !== f.sha256) throw new Error("OpenViking \uBC88\uB4E4 \uBB34\uACB0\uC131 \uC624\uB958");
    }
    return { executable: import_node_path5.default.join(root, "python", process.platform === "win32" ? "python.exe" : "bin/python3"), launcher: import_node_path5.default.join(root, "launch.py"), cwd: root };
  }
  async start(config, workspace = import_node_path5.default.join(this.data, "openviking", "data"), account = vikingAccount, maintenance = false) {
    this.account = account;
    this.maintenance = maintenance;
    this.startupStage = "bundle";
    const launch = await this.resolveLaunch();
    this.personal = new PersonalKnowledge(
      import_node_path5.default.join(this.data, "openviking"),
      launch.executable,
      (user, route, options) => this.request(route, options?.body, false, options?.method, options?.signal, user)
    );
    this.startupStage = "configuration";
    const folder = import_node_path5.default.join(this.data, "openviking");
    await (0, import_promises6.mkdir)(folder, { recursive: true, mode: 448 });
    this.gateway = new OpenVikingGateway(config, (event) => {
      this.modelEvents.push(event);
      this.modelEvents = this.modelEvents.slice(-20);
      const events = structuredClone(this.modelEvents);
      this.diagnosticWrites = this.diagnosticWrites.catch(() => {
      }).then(() => atomicJSON(import_node_path5.default.join(folder, "model-status.json"), { schemaVersion: 1, events }));
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
    this.token = (0, import_node_crypto6.randomBytes)(32).toString("hex");
    const gateway = this.gateway;
    const embedding = config.openViking.embedding;
    const vlm = config.openViking.vlm ?? config.model;
    this.configFile = import_node_path5.default.join(folder, `runtime-${(0, import_node_crypto6.randomBytes)(8).toString("hex")}.json`);
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
    let launchError;
    let stderr = "";
    let lastHealthStatus;
    this.process = (0, import_node_child_process2.spawn)(launch.executable, ["-I", "-B", launch.launcher, "--config", this.configFile, "--port", String(port)], {
      cwd: launch.cwd,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        SYSTEMROOT: process.env.SYSTEMROOT,
        WINDIR: process.env.WINDIR,
        TEMP: process.env.TEMP,
        TMP: process.env.TMP,
        PATH: import_node_path5.default.dirname(launch.executable),
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
        TIKTOKEN_CACHE_DIR: import_node_path5.default.join(launch.cwd, "tokenizers")
      }
    });
    this.process.stdout.on("data", () => {
    });
    this.process.stderr.on("data", (bytes) => {
      const text = bytes.toString();
      stderr = (stderr + text).slice(-32768);
      launch.diagnostic?.(text);
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
    while (Date.now() < deadline && !this.exited) {
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
    form.append("file", new Blob([content], { type: "text/plain" }), import_node_path5.default.basename(filename).replace(/[^a-zA-Z0-9_.-]/g, "_") + ".txt");
    const response = await fetch(this.baseUrl + "/api/v1/resources/temp_upload", { method: "POST", redirect: "error", headers: this.credentials("local-user"), body: form, signal: AbortSignal.timeout(3e4) });
    if (!response.ok) {
      this.testLaunch?.diagnostic?.(`Upload HTTP ${response.status}: ${await response.text()}`);
      throw new Error("OpenViking \uD30C\uC77C \uC804\uB2EC \uC2E4\uD328");
    }
    const upload = await response.json();
    const id = upload.result?.temp_file_id ?? upload.temp_file_id;
    if (typeof id !== "string") throw new Error("OpenViking \uC5C5\uB85C\uB4DC \uD655\uC778 \uC2E4\uD328");
    const target = knowledgeRoot(project) + "/" + (0, import_node_crypto6.createHash)("sha256").update(filename).digest("hex").slice(0, 20);
    await this.request("/api/v1/resources", { temp_file_id: id, to: target, wait: true, reason: "\uC0AC\uC6A9\uC790\uAC00 \uC120\uD0DD\uD55C \uD504\uB85C\uC81D\uD2B8 \uD14D\uC2A4\uD2B8 \uD30C\uC77C", processing_mode: "vectors_only" });
    this.value.indexedFiles++;
    this.changed();
    return `OpenViking \uC0C9\uC778 \uC644\uB8CC: ${filename}`;
  }
  async stop() {
    this.expectedExit = true;
    await this.personal?.close();
    this.personal = void 0;
    this.registrationAbort?.abort();
    await this.registration?.catch(() => {
    });
    this.registration = void 0;
    this.registrationAbort = void 0;
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
    if (this.configFile) await (0, import_promises6.unlink)(this.configFile).catch(() => {
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

// tests/openviking-namespace.integration.test.ts
var currentPython = import_node_path6.default.resolve(process.env.NED_TEST_CURRENT_PYTHON ?? ".cache/openviking/env-linux/bin/python3");
var previousPython = import_node_path6.default.resolve(process.env.NED_TEST_PREVIOUS_PYTHON ?? ".cache/openviking/env-0.5.4/bin/python3");
var inputSkills = import_node_path6.default.resolve(process.env.NED_TEST_SKILLS_DIR ?? "vendor/skills");
var sha = (v) => (0, import_node_crypto7.createHash)("sha256").update(v).digest("hex");
(0, import_node_test.test)(
  "real 0.5.4 account migrates through 0.5.5 with project/personal search, renamed packages and intact raw backup",
  { skip: !(0, import_node_fs3.existsSync)(currentPython) || !(0, import_node_fs3.existsSync)(previousPython), timeout: 3e5 },
  async (t) => {
    const root = await (0, import_promises7.mkdtemp)(import_node_path6.default.join((0, import_node_os.tmpdir)(), "ned-viking-upgrade-"));
    const services = [];
    let diagnostics = "";
    t.after(async () => {
      for (const service of services) await service.close();
      await (0, import_promises7.rm)(root, { recursive: true, force: true });
    });
    const execute = (0, import_node_util2.promisify)(import_node_child_process3.execFile);
    for (const [python, expected] of [[previousPython, "0.5.4"], [currentPython, "0.5.5"]]) {
      const result = await execute(python, ["-I", "-B", "-c", 'from importlib.metadata import version; print(version("openviking"))']);
      import_strict.default.equal(result.stdout.trim(), expected);
    }
    const modelRequests = [];
    const endpoint2 = (0, import_node_http4.createServer)(async (req, res) => {
      let raw = "";
      for await (const bytes2 of req) raw += bytes2;
      modelRequests.push(req.url);
      const body = JSON.parse(raw);
      const payload = req.url === "/v1/embeddings" ? { object: "list", model: "embed-test", data: (Array.isArray(body.input) ? body.input : [body.input]).map((_, index) => ({ object: "embedding", index, embedding: [0.5, 0.25, 0.125, 0.75] })), usage: { prompt_tokens: 1, total_tokens: 1 } } : { id: "test", object: "chat.completion", model: "llm-test", choices: [{ index: 0, message: { role: "assistant", content: "Local test document." }, finish_reason: "stop" }], usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 } };
      res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(payload));
    });
    await new Promise((resolve) => endpoint2.listen(0, "127.0.0.1", resolve));
    t.after(() => {
      endpoint2.closeAllConnections();
      endpoint2.close();
    });
    const baseUrl = `http://127.0.0.1:${endpoint2.address().port}/v1`;
    const config = configSchema.parse({ schemaVersion: 2, model: { baseUrl, apiKey: "synthetic-llm", id: "llm-test" }, openViking: { enabled: true, embedding: { baseUrl, apiKey: "synthetic-embedding", id: "embed-test", dimension: 4 } } });
    const bundle = import_node_path6.default.join(root, "resources/ned/skills");
    await (0, import_promises7.mkdir)(bundle, { recursive: true });
    const manifest = JSON.parse(await (0, import_promises7.readFile)(import_node_path6.default.join(inputSkills, "manifest.json"), "utf8"));
    manifest.skills = manifest.skills.filter((s) => ["cpp-testing", "ab-testing"].includes(s.id));
    for (const entry of manifest.skills) await (0, import_promises7.cp)(import_node_path6.default.join(inputSkills, entry.directory), import_node_path6.default.join(bundle, entry.directory), { recursive: true });
    const bytes = JSON.stringify(manifest);
    await (0, import_promises7.writeFile)(import_node_path6.default.join(bundle, "manifest.json"), bytes);
    await (0, import_promises7.writeFile)(import_node_path6.default.join(bundle, "../skills-lock.json"), JSON.stringify({ schemaVersion: 1, count: 2, manifestSha256: sha(bytes) }));
    await (0, import_promises7.cp)(process.env.NED_TEST_TOKENIZERS_DIR ?? "vendor/runtime/windows-x64/openviking/tokenizers", import_node_path6.default.join(root, "tokenizers"), { recursive: true });
    const make = (executable, skills) => {
      const service = new OpenVikingService(root, root, () => {
      }, { executable, launcher: import_node_path6.default.resolve("scripts/openviking-launch.py"), cwd: root, diagnostic: (text) => {
        diagnostics += text;
      } }, skills);
      services.push(service);
      return service;
    };
    const old = make(previousPython), internal = old;
    await internal.start(config, import_node_path6.default.join(root, "openviking/data"), previousVikingAccount, true);
    internal.update("ready");
    await old.index("p1", "protocol.md", "Legacy project reconnect interval is seven seconds.").catch((error) => import_strict.default.fail(String(error) + "\n" + diagnostics.slice(-1e4)));
    const request = (route, body) => internal.request(route, body, false);
    await request("/api/v1/fs/mv", { from_uri: "viking://resources/ned", to_uri: "viking://resources/" + previousVikingAccount });
    const personalRequest = (route, body) => internal.request(route, body, false, void 0, void 0, "default");
    await personalRequest("/api/v1/fs/mkdir", { uri: "viking://user/default/resources" });
    await personalRequest("/api/v1/content/write", { uri: "viking://user/default/resources/rules.md", content: "Personal rule: preserve the existing compiler version.", mode: "create", wait: true, processing_mode: "vectors_only" });
    await (0, import_promises7.writeFile)(import_node_path6.default.join(root, "openviking/personal-imports.json"), JSON.stringify({ schemaVersion: 1, entries: [{ sha256: "a".repeat(64), root: "viking://user/default", roots: ["viking://user/default/resources"], status: "ready", files: 1, importedAt: (/* @__PURE__ */ new Date()).toISOString() }] }));
    const registry = { schemaVersion: 1, entries: {} };
    for (const pkg of await loadBundledSkillPackages(bundle)) {
      const name = previousVikingAccount + "-" + pkg.id;
      const currentZip = import_node_path6.default.join(root, pkg.name + ".zip"), previousZip = import_node_path6.default.join(root, name + ".zip");
      await (0, import_promises7.writeFile)(currentZip, pkg.archive);
      await execute(previousPython, ["-I", "-B", "-c", `import sys, zipfile
with zipfile.ZipFile(sys.argv[1]) as source, zipfile.ZipFile(sys.argv[2], 'w') as target:
    for entry in source.infolist():
        name = entry.filename.replace(sys.argv[3] + '/', sys.argv[4] + '/', 1)
        data = source.read(entry)
        if name.endswith('/NED-BUNDLE.json'):
            name = name[:-len('NED-BUNDLE.json')] + 'L-VIBE-BUNDLE.json'
        if name.endswith('/SKILL.md'):
            data = data.replace(('name: ' + sys.argv[3] + '\\n').encode(), ('name: ' + sys.argv[4] + '\\n').encode(), 1)
        target.writestr(name, data)
`, currentZip, previousZip, pkg.name, name]);
      const previousArchive = await (0, import_promises7.readFile)(previousZip), previousHash = sha(previousArchive);
      import_strict.default.notEqual(previousHash, pkg.hash);
      const form = new FormData();
      form.append("file", new Blob([new Uint8Array(previousArchive)]), name + ".zip");
      const upload = await request("/api/v1/resources/temp_upload", form);
      await request("/api/v1/skills", {
        temp_file_id: upload.result.temp_file_id,
        target_uri: "viking://agent/skills",
        wait: true,
        source_metadata: { [previousSkillOwner]: "bundled-skills", [previousSkillHash]: previousHash }
      });
      const remote = await request("/api/v1/skills/" + name + "?target_uri=viking%3A%2F%2Fagent%2Fskills&include_integrity=true&include_files=true&include_source=true");
      registry.entries[pkg.id] = { revision: remote.result.revision, bundleHash: previousHash };
    }
    await (0, import_promises7.writeFile)(import_node_path6.default.join(root, "openviking/bundled-skills.json"), JSON.stringify(registry));
    await request("/api/v1/system/wait", {});
    await old.close();
    const originalFile = import_node_path6.default.join(root, "openviking/data/viking", previousVikingAccount, "user/default/resources/rules.md");
    const originalBytes = await (0, import_promises7.readFile)(originalFile);
    const current = make(currentPython, bundle);
    await current.configure(config);
    import_strict.default.equal(current.state().status, "ready", JSON.stringify(current.state()) + diagnostics.slice(-1e4));
    const deadline = Date.now() + 18e4;
    while (["pending", "registering"].includes(current.state().skills?.status ?? "") && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 100));
    if (current.state().skills?.status !== "ready") {
      const debug = [];
      for (const pkg of await loadBundledSkillPackages(bundle)) {
        const remote = await current.request("/api/v1/skills/" + pkg.name + "?target_uri=viking%3A%2F%2Fagent%2Fskills&include_integrity=true&include_files=true&include_source=true");
        debug.push({ id: pkg.id, before: registry.entries[pkg.id], after: {
          revision: remote.result.revision,
          source: remote.result.source,
          files: remote.result.files.map((f) => ({ path: f.path, sha256: f.sha256 }))
        } });
      }
      import_strict.default.fail(JSON.stringify({ state: current.state().skills, debug }));
    }
    import_strict.default.equal(current.state().skills?.status, "ready", JSON.stringify(current.state().skills) + diagnostics.slice(-1e4));
    const studio = await current.studioConnection();
    import_strict.default.equal(studio.headers["X-OpenViking-Account"], "ned");
    import_strict.default.equal(studio.headers["X-OpenViking-Role"], "admin");
    import_strict.default.equal(current.credentials("local-user")["X-OpenViking-Role"], void 0, "human Studio permission must not change model tools");
    const studioPage = await fetch(studio.baseUrl + "/studio/", { headers: studio.headers });
    import_strict.default.equal(studioPage.status, 200);
    import_strict.default.match(await studioPage.text(), /\/studio\/assets\//);
    const found = JSON.parse(await current.search("p1", "reconnect", 3));
    import_strict.default.match(JSON.stringify(found), /viking:\/\/resources\/ned\/p1/);
    await import_strict.default.rejects(current.read("p2", "viking://resources/ned/p1/file"));
    import_strict.default.match(await current.personalSearch("compiler", 3), /rules\.md/);
    import_strict.default.match(await current.personalRead("viking://user/default/resources/rules.md"), /preserve/);
    const journal = JSON.parse(await (0, import_promises7.readFile)(import_node_path6.default.join(root, "openviking/namespace-migration.json"), "utf8"));
    import_strict.default.equal(journal.phase, "ready");
    import_strict.default.deepEqual(await (0, import_promises7.readFile)(import_node_path6.default.join(root, "openviking/namespace-backups", journal.id, "original/viking", previousVikingAccount, "user/default/resources/rules.md")), originalBytes);
    const accounts = await (0, import_promises7.readdir)(import_node_path6.default.join(root, "openviking/data/viking"));
    import_strict.default.ok(accounts.includes("ned"));
    import_strict.default.ok(!accounts.includes(previousVikingAccount));
    const names = await (0, import_promises7.readdir)(import_node_path6.default.join(root, "openviking/data/viking/ned/agent/skills"));
    import_strict.default.ok(names.includes("ned-cpp-testing") && names.includes("ned-ab-testing"));
    import_strict.default.ok(names.every((n) => !n.startsWith(previousVikingAccount)));
    for (const name of ["ned-cpp-testing", "ned-ab-testing"]) {
      const files = await (0, import_promises7.readdir)(import_node_path6.default.join(root, "openviking/data/viking/ned/agent/skills", name));
      import_strict.default.ok(files.includes("NED-BUNDLE.json"));
      import_strict.default.ok(!files.includes("L-VIBE-BUNDLE.json"));
    }
    const before = modelRequests.length;
    await current.configure(config);
    while (["pending", "registering"].includes(current.state().skills?.status ?? "") && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 100));
    import_strict.default.equal(current.state().skills?.status, "ready", diagnostics.slice(-1e4));
    import_strict.default.equal(modelRequests.length, before, "unchanged restart must not re-index migrated skill packages");
    t.diagnostic("Verified 0.5.4 -> 0.5.5; project/personal search; two renamed skills; original bytes retained; no restart re-index. Model endpoints were localhost synthetic servers only.");
  }
);
