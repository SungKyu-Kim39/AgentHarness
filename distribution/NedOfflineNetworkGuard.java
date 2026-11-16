import java.net.SocketPermission;
import java.security.Permission;

/** Java 21-only guard for Ned's pinned Ghidra JVM. Not a general sandbox. */
@SuppressWarnings("removal")
public final class NedOfflineNetworkGuard extends SecurityManager {
    private static boolean loopback(String host) {
        return "127.0.0.1".equals(host) || "localhost".equalsIgnoreCase(host)
            || "::1".equals(host) || "[::1]".equals(host) || "0:0:0:0:0:0:0:1".equals(host);
    }
    @Override public void checkConnect(String host, int port) {
        if (!loopback(host)) throw new SecurityException("NED_GHIDRA_EXTERNAL_NETWORK_BLOCKED");
    }
    @Override public void checkConnect(String host, int port, Object context) { checkConnect(host, port); }
    @Override public void checkAccept(String host, int port) { checkConnect(host, port); }
    @Override public void checkPermission(Permission permission) {
        if (permission instanceof SocketPermission) {
            String address = permission.getName();
            String host = address.startsWith("[") ? address.substring(0, address.indexOf(']') + 1) : address.split(":", 2)[0];
            if (!loopback(host)) throw new SecurityException("NED_GHIDRA_EXTERNAL_NETWORK_BLOCKED");
        }
        if (permission instanceof RuntimePermission && "setSecurityManager".equals(permission.getName()))
            throw new SecurityException("NED_GHIDRA_NETWORK_GUARD_LOCKED");
    }
    @Override public void checkPermission(Permission permission, Object context) { checkPermission(permission); }
}
